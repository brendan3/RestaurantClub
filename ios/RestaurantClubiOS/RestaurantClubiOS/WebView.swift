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
        
        let contentController = WKUserContentController()
        
        // iPad-only safety-net: ensure sidebar nav items meet Apple's 44pt
        // minimum tap target and carry accessible labels/tooltips.
        if UIDevice.current.userInterfaceIdiom == .pad {
            let scriptSource = #"""
            (function () {
              try {
                var mapping = {
                  "/": "Home", "/home": "Home", "/dashboard": "Home",
                  "/social": "Social Feed", "/feed": "Social Feed",
                  "/history": "History", "/profile": "Profile",
                  "/settings": "Settings", "/search": "Search", "/club": "Club"
                };

                function patch() {
                  var nav = document.querySelector("aside nav") || document.querySelector("aside");
                  if (!nav) return;
                  var items = nav.querySelectorAll("a, button");
                  items.forEach(function (el) {
                    try {
                      el.style.minHeight = "44px";
                      el.style.minWidth = "44px";
                      var label = el.getAttribute("aria-label") || el.getAttribute("title") || "";
                      if (!label) {
                        var text = (el.textContent || "").trim();
                        if (text) { label = text; }
                        else {
                          var href = (el.getAttribute("href") || "").toLowerCase();
                          label = mapping[href] || "Navigation item";
                        }
                      }
                      if (label) {
                        el.setAttribute("aria-label", label);
                        el.setAttribute("title", label);
                      }
                    } catch (_) {}
                  });
                }

                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", patch);
                } else { patch(); }
                window.addEventListener("resize", patch);
              } catch (_) {}
            })();
            """#
            
            let userScript = WKUserScript(
                source: scriptSource,
                injectionTime: .atDocumentEnd,
                forMainFrameOnly: true
            )
            contentController.addUserScript(userScript)
        }
        
        configuration.userContentController = contentController
        
        let webView = InspectableWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        
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


