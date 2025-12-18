import SwiftUI
import UserNotifications
import UIKit

// MARK: - Singleton manager

final class PushNotificationManager: NSObject, ObservableObject {
    static let shared = PushNotificationManager()

    @Published var deviceToken: String?

    // Call this once the app launches (after user is on Home)
    func registerForPushNotifications() {
        let center = UNUserNotificationCenter.current()
        center.delegate = self

        center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if let error = error {
                print("Push permission error:", error)
            }

            DispatchQueue.main.async {
                if granted {
                    UIApplication.shared.registerForRemoteNotifications()
                } else {
                    print("Push permission not granted")
                }
            }
        }
    }

    // Send the APNs token to your backend
    func sendDeviceTokenToServer(_ token: String) {
        deviceToken = token

        guard let url = URL(string: "https://restaurant-club-eight.vercel.app/api/push/devices") else {
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "platform": "ios",
            "token": token
            // If later you want to tag the user natively, you can add fields here
            // e.g. "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        ]

        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])

        URLSession.shared.dataTask(with: request) { _, response, error in
            if let error = error {
                print("Failed to register push device:", error)
                return
            }

            if let http = response as? HTTPURLResponse {
                print("Push device register status:", http.statusCode)
            }
        }.resume()
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension PushNotificationManager: UNUserNotificationCenterDelegate {
    // Show banner/sound when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound, .badge])
    }

    // Handle taps on notifications (later you can forward this to the WebView)
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        // TODO: If you want to deep-link into a specific event,
        // parse response.notification.request.content.userInfo here
        completionHandler()
    }
}

// MARK: - AppDelegate for APNs callbacks

class AppDelegate: NSObject, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        // Convert binary token to hex string
        let tokenParts = deviceToken.map { String(format: "%02x", $0) }
        let tokenString = tokenParts.joined()
        print("APNs device token:", tokenString)

        PushNotificationManager.shared.sendDeviceTokenToServer(tokenString)
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("Failed to register for remote notifications:", error)
    }
}
