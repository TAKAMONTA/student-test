import SwiftUI

@main
struct Chu1TestKitApp: App {
    @StateObject private var webViewModel = WebViewModel(config: .production)

    var body: some Scene {
        WindowGroup {
            ContentView(webViewModel: webViewModel)
                .onOpenURL { url in
                    webViewModel.open(url)
                }
        }
    }
}
