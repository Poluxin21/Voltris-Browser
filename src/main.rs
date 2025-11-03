#![cfg_attr(windows, windows_subsystem = "windows")]

use tao::{
    dpi::{PhysicalPosition, PhysicalSize},
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};
use wry::{Rect, WebViewBuilder};

use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let ui_html_path = Path::new("ui.html");
    let ui_html = fs::read_to_string(ui_html_path).expect(
        "Erro ao ler o arquivo ui.html. Certifique-se de que ele existe no diretório do projeto.",
    );

    let event_loop = EventLoop::new();

    let initial_size = PhysicalSize::new(1024, 768);

    let window = WindowBuilder::new()
        .with_title("Voltris")
        .with_inner_size(initial_size)
        .build(&event_loop)?;

    const UI_HEIGHT: u32 = 100;

    let content_bounds = Rect {
        position: PhysicalPosition::new(0, UI_HEIGHT as i32).into(),
        size: PhysicalSize::new(initial_size.width, initial_size.height - UI_HEIGHT).into(),
    };

    let ui_bounds = Rect {
        position: PhysicalPosition::new(0, 0).into(),
        size: PhysicalSize::new(initial_size.width, UI_HEIGHT).into(),
    };

    let webview_content = WebViewBuilder::new()
        .with_url("https://google.com")
        .with_bounds(content_bounds)
        .build(&window)?;

    let webview_content = Arc::new(Mutex::new(webview_content));
    let webview_content_clone = Arc::clone(&webview_content);

    let webview_ui = WebViewBuilder::new()
        .with_html(&ui_html)
        .with_bounds(ui_bounds)
        .with_devtools(false)
        .with_ipc_handler(move |req: wry::http::Request<String>| {
            let msg = req.body();

            if let Some(url) = msg.strip_prefix("navigate:") {
                println!("Navegando para: {}", url);

                if let Ok(webview) = webview_content_clone.lock() {
                    match webview.load_url(url) {
                        Ok(_) => {
                            println!("✓ URL carregada com sucesso");
                        }
                        Err(e) => {
                            eprintln!("✗ Erro ao carregar URL: {}", e);
                        }
                    }
                }
            }
        })
        .build(&window)?;

    let webview_ui = Arc::new(Mutex::new(webview_ui));

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => {
                *control_flow = ControlFlow::Exit;
            }
            Event::WindowEvent {
                event: WindowEvent::Resized(new_size),
                ..
            } => {
                let new_content_bounds = Rect {
                    position: PhysicalPosition::new(0, UI_HEIGHT as i32).into(),
                    size: PhysicalSize::new(new_size.width, new_size.height - UI_HEIGHT).into(),
                };
                let new_ui_bounds = Rect {
                    position: PhysicalPosition::new(0, 0).into(),
                    size: PhysicalSize::new(new_size.width, UI_HEIGHT).into(),
                };

                if let Ok(webview) = webview_content.lock() {
                    webview.set_bounds(new_content_bounds).unwrap();
                }
                if let Ok(webview_ui) = webview_ui.lock() {
                    webview_ui.set_bounds(new_ui_bounds).unwrap();
                }
            }
            _ => (),
        }
    });
}
