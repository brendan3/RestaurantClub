//
//  ContentView.swift
//  RestaurantClubiOS
//
//  Created by RestaurantClub Team
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: Configuration.webAppURL)!)
            .ignoresSafeArea()
    }
}

#Preview {
    ContentView()
}

