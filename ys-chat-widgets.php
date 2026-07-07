<?php
/**
 * Plugin Name: YS CHAT Widgets
 * Plugin URI:  https://yangsheep.com.tw
 * Description: 浮動聯絡按鈕（LINE、Messenger、WhatsApp、電話、Email 等）。純錨點連結設計，不使用 iframe，不會在 iOS / Apple 裝置上誤觸發開啟 App。初次啟用時自動偵測並移轉 NinjaTeam Click to Chat（WP Support All-in-One）設定。
 * Version:     1.0.0
 * Author:      YANGSHEEP DESIGN
 * Author URI:  https://yangsheep.com.tw
 * License:     GPL-2.0-or-later
 * Text Domain: ys-chat-widgets
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 *
 * @package YangSheep\ChatWidgets
 */

defined( 'ABSPATH' ) || exit;

/* ──────────────────────────────────────────────
 * 常數定義
 * ────────────────────────────────────────────── */
define( 'YS_CHAT_WIDGETS_VERSION', '1.0.0' );
define( 'YS_CHAT_WIDGETS_PLUGIN_FILE', __FILE__ );
define( 'YS_CHAT_WIDGETS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'YS_CHAT_WIDGETS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'YS_CHAT_WIDGETS_BASENAME', plugin_basename( __FILE__ ) );

/* ──────────────────────────────────────────────
 * Vendor autoload（Hub Client）
 * ────────────────────────────────────────────── */
if ( file_exists( YS_CHAT_WIDGETS_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
    require_once YS_CHAT_WIDGETS_PLUGIN_DIR . 'vendor/autoload.php';
}

/* ──────────────────────────────────────────────
 * Fallback PSR-4 Autoloader
 * 永遠註冊自身 namespace，不放 else 分支
 * ────────────────────────────────────────────── */
spl_autoload_register( function ( $class ) {
    $prefix   = 'YangSheep\\ChatWidgets\\';
    $base_dir = YS_CHAT_WIDGETS_PLUGIN_DIR . 'src/';
    $len      = strlen( $prefix );

    if ( 0 !== strncmp( $prefix, $class, $len ) ) {
        return;
    }

    $relative = substr( $class, $len );
    $file     = $base_dir . str_replace( '\\', '/', $relative ) . '.php';

    if ( file_exists( $file ) ) {
        require_once $file;
    }
} );

/* ──────────────────────────────────────────────
 * Hub Client 註冊（priority 5，比其他 hook 早）
 * ────────────────────────────────────────────── */
add_action( 'plugins_loaded', function () {
    if ( class_exists( '\YangSheep\PluginHubClient\YSPluginHubClient' ) ) {
        \YangSheep\PluginHubClient\YSPluginHubClient::register( array(
            'slug'        => 'ys-chat-widgets',
            'version'     => YS_CHAT_WIDGETS_VERSION,
            'plugin_file' => __FILE__,
            'name'        => 'YS CHAT Widgets',
        ) );
    }
}, 5 );

/* ──────────────────────────────────────────────
 * Activation — 建表 + 偵測 NinjaTeam 外掛並自動移轉
 * ────────────────────────────────────────────── */
register_activation_hook( __FILE__, function () {
    \YangSheep\ChatWidgets\Database\YSChatTableMaker::create_tables();
    \YangSheep\ChatWidgets\YSChatMigration::maybe_migrate();
} );

/* ──────────────────────────────────────────────
 * 主外掛初始化（priority 11，在 Hub Client 之後）
 * ────────────────────────────────────────────── */
add_action( 'plugins_loaded', function () {
    \YangSheep\ChatWidgets\YSChatWidgets::instance();
}, 11 );

/* ──────────────────────────────────────────────
 * 外掛動作連結（設定頁快捷）
 * ────────────────────────────────────────────── */
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( array $links ): array {
    $url = admin_url( 'admin.php?page=ys-chat-widgets' );
    array_unshift(
        $links,
        '<a href="' . esc_url( $url ) . '">' . esc_html__( '設定', 'ys-chat-widgets' ) . '</a>'
    );
    return $links;
} );
