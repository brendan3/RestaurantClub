//
//  WebView.swift
//  RestaurantClubiOS
//
//  Created by RestaurantClub Team
//

import SwiftUI
import WebKit
import CoreLocation

// MARK: - Location Permission Helper

class LocationPermissionManager: NSObject, CLLocationManagerDelegate {
    static let shared = LocationPermissionManager()
    
    private let manager = CLLocationManager()
    
    private override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }
    
    func requestWhenInUseIfNeeded() {
        let status: CLAuthorizationStatus
        
        if #available(iOS 14.0, *) {
            status = manager.authorizationStatus
        } else {
            status = CLLocationManager.authorizationStatus()
        }
        
        switch status {
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        default:
            break  // already decided (authorized / denied / restricted)
        }
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        // Optional: you can log here for debugging if you want
        // print("Location auth changed: \(manager.authorizationStatus.rawValue)")
    }
}

// MARK: - Inspectable WebView

class InspectableWebView: WKWebView {
    override init(frame: CGRect, configuration: WKWebViewConfiguration) {
        super.init(frame: frame, configuration: configuration)
        
        if #available(iOS 16.4, *) {
            self.isInspectable = true   // Make WKWebView inspectable in Safari Dev Tools
        }
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        
        if #available(iOS 16.4, *) {
            self.isInspectable = true
        }
    }
}

// MARK: - SwiftUI Wrapper

struct WebView: UIViewRepresentable {
    let url: URL
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = InspectableWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        
        // Request location permission when the webview is created
        LocationPermissionManager.shared.requestWhenInUseIfNeeded()
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        if uiView.url != url {
            uiView.load(request)
        }
    }
}


