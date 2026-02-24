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
        
        // iPad-only CSS/JS patch to improve left navigation visibility and tap targets.
        if UIDevice.current.userInterfaceIdiom == .pad {
            let scriptSource = #"""
            (function () {
              try {
                function applyNavEnhancements() {
                  var doc = window.document;
                  if (!doc) return;

                  // Find likely left navigation rails/sidebars.
                  var sidebars = Array.prototype.slice.call(
                    doc.querySelectorAll("aside, [data-slot='sidebar'], [data-sidebar='sidebar']")
                  );

                  if (sidebars.length === 0) {
                    return;
                  }

                  sidebars.forEach(function (sidebar) {
                    try {
                      var style = sidebar.style;
                      // Ensure the rail is fully on-screen on the left.
                      if (!style.position) {
                        style.position = "relative";
                      }
                      style.left = "0px";
                      style.marginLeft = "0px";
                      style.maxWidth = style.maxWidth || "18rem";
                      style.minWidth = style.minWidth || "4.5rem";

                      var rect = sidebar.getBoundingClientRect();
                      if (rect.left < 0) {
                        var offset = (-rect.left) + 8; // small padding from edge
                        style.marginLeft = offset + "px";
                      }
                    } catch (e) {
                      // Fail silently per element.
                    }
                  });

                  sidebars.forEach(function (sidebar) {
                    try {
                      var nav = sidebar.querySelector("nav") || sidebar;
                      if (!nav) return;

                      var items = nav.querySelectorAll("a, button, [role='button']");
                      if (!items || items.length === 0) return;

                      items.forEach(function (item) {
                        try {
                          var style = item.style;

                          // Ensure minimum tap target size (~44x44 points).
                          if (!style.minWidth) {
                            style.minWidth = "44px";
                          }
                          if (!style.minHeight) {
                            style.minHeight = "44px";
                          }
                          if (!style.display) {
                            style.display = "flex";
                          }
                          if (!style.alignItems) {
                            style.alignItems = "center";
                          }

                          // Derive a readable label/title for icon-only items.
                          var label =
                            item.getAttribute("aria-label") ||
                            item.getAttribute("title") ||
                            "";

                          if (!label) {
                            var text = (item.textContent || "").trim();
                            if (text) {
                              label = text;
                            } else {
                              var href = (item.getAttribute("href") || "").toLowerCase();
                              var dataTestId = (item.getAttribute("data-testid") || "").toLowerCase();
                              var inferred = "";

                              var mapping = {
                                "/": "Home",
                                "/home": "Home",
                                "/dashboard": "Home",
                                "/social": "Social Feed",
                                "/feed": "Social Feed",
                                "/history": "History",
                                "/profile": "Profile",
                                "/account": "Profile",
                                "/settings": "Settings",
                                "/search": "Search",
                                "/club": "Club",
                              };

                              if (mapping[href]) {
                                inferred = mapping[href];
                              } else if (mapping[dataTestId]) {
                                inferred = mapping[dataTestId];
                              }

                              label = inferred || "Navigation item";
                            }
                          }

                          if (label) {
                            item.setAttribute("aria-label", label);
                            // Title gives a tooltip on long-press / pointer hover.
                            item.setAttribute("title", label);
                          }
                        } catch (e) {
                          // Ignore individual item errors.
                        }
                      });
                    } catch (e) {
                      // Ignore nav-level errors.
                    }
                  });

                  // Gently nudge main content to the right if needed so nav and content don't collide.
                  var roots = [
                    doc.getElementById("root"),
                    doc.getElementById("app"),
                    doc.body && doc.body.firstElementChild,
                  ].filter(function (el) { return !!el; });

                  roots.forEach(function (root) {
                    try {
                      var currentPadding = window.getComputedStyle(root).paddingLeft;
                      if (!currentPadding || currentPadding === "0px") {
                        root.style.paddingLeft = "16px";
                      }
                    } catch (e) {
                      // Ignore padding adjustments issues.
                    }
                  });
                }

                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", applyNavEnhancements);
                } else {
                  applyNavEnhancements();
                }

                window.addEventListener("resize", applyNavEnhancements);
              } catch (e) {
                // Fail silently overall – never break the page.
              }
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


