//
//  RestaurantClubiOSApp.swift
//  RestaurantClubiOS
//
//  Created by RestaurantClub Team
//

import SwiftUI

@main
struct RestaurantClubiOSApp: App {
    // Hook AppDelegate so we receive APNs callbacks
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onAppear {
                    // You can move this behind a “Allow notifications?” prompt later
                    PushNotificationManager.shared.registerForPushNotifications()
                }
        }
    }
}
