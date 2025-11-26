//
//  Configuration.swift
//  RestaurantClubiOS
//
//  Created by RestaurantClub Team
//

import Foundation

struct Configuration {
    // MARK: - Web App URL Configuration
    
    // For local development, use localhost
    // For production, replace with your deployed URL
    
    #if DEBUG
    // Local development - make sure your dev server is running
    static let webAppURL = "http://localhost:5000"
    #else
    // Production - UPDATE THIS with your deployed URL from Railway/Render
    // Example: "https://restaurantclub-production.up.railway.app"
    static let webAppURL = "http://localhost:5000"  // TODO: Replace with production URL
    #endif
}

