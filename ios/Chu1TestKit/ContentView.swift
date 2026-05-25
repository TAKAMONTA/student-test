import SwiftUI

struct ContentView: View {
    @ObservedObject var webViewModel: WebViewModel

    var body: some View {
        AppWebView(model: webViewModel, config: webViewModel.config)
            .ignoresSafeArea(.container, edges: .bottom)
    }
}
