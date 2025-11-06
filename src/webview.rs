use std::sync::{Arc, Mutex};

pub struct WebViewEntry {
    pub id: i32,
    pub view: Arc<Mutex<wry::WebView>>,
}
