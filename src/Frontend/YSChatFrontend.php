<?php
/**
 * 前端浮動聯絡按鈕輸出
 *
 * 安全設計原則：
 * - 每個 App 都是純 <a href> 錨點 — 只有使用者「點擊」才會開啟。
 * - 不使用 iframe、不使用 JS 導向、不預載任何外部資源
 *   （NinjaTeam 以 iframe 載入 line.me 造成 iOS/Apple 裝置
 *   一進頁就跳「要開啟 LINE 嗎？」，本外掛從結構上根絕）。
 *
 * @package YangSheep\ChatWidgets\Frontend
 * @since   1.0.0
 */

namespace YangSheep\ChatWidgets\Frontend;

use YangSheep\ChatWidgets\YSChatApps;
use YangSheep\ChatWidgets\YSChatWidgets;

defined( 'ABSPATH' ) || exit;

class YSChatFrontend {

    public function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_assets' ] );
        add_action( 'wp_footer', [ $this, 'render_widget' ] );
    }

    /**
     * 是否應該輸出（啟用 + 裝置 + 頁面條件）
     */
    private function should_render( array $settings ): bool {
        if ( empty( $settings['enabled'] ) ) {
            return false;
        }
        if ( empty( $settings['apps'] ) ) {
            return false;
        }

        $is_mobile = wp_is_mobile();
        if ( $is_mobile && empty( $settings['show_mobile'] ) ) {
            return false;
        }
        if ( ! $is_mobile && empty( $settings['show_desktop'] ) ) {
            return false;
        }

        // 頁面條件。
        $display = $settings['display'] ?? 'all';
        if ( 'all' === $display ) {
            return true;
        }

        $current_id = $this->current_page_id();

        if ( 'include' === $display ) {
            return in_array( $current_id, array_map( 'intval', (array) $settings['include_pages'] ), true );
        }
        if ( 'exclude' === $display ) {
            return ! in_array( $current_id, array_map( 'intval', (array) $settings['exclude_pages'] ), true );
        }

        return true;
    }

    /**
     * 目前頁面 ID（含文章頁 / WooCommerce 商店頁對應）
     */
    private function current_page_id(): int {
        $id = (int) get_queried_object_id();

        if ( ! is_front_page() && is_home() ) {
            $id = (int) get_option( 'page_for_posts' );
        }
        if ( function_exists( 'is_shop' ) && is_shop() ) {
            $id = (int) get_option( 'woocommerce_shop_page_id' );
        }

        return $id;
    }

    /**
     * 載入前端資源（僅在需要輸出時）
     */
    public function enqueue_assets(): void {
        $settings = YSChatWidgets::get_settings();
        if ( ! $this->should_render( $settings ) ) {
            return;
        }

        wp_enqueue_style(
            'ys-chat-widgets',
            YS_CHAT_WIDGETS_PLUGIN_URL . 'assets/css/ys-chat-frontend.css',
            [],
            YS_CHAT_WIDGETS_VERSION
        );

        $deps = [];

        // popup（QR 卡片）模式才載入本地 QR 生成器（MIT — Kazuhiko Arase）。
        if ( 'popup' === ( $settings['mode'] ?? 'redirect' ) ) {
            wp_enqueue_script(
                'ys-chat-qrcode',
                YS_CHAT_WIDGETS_PLUGIN_URL . 'assets/js/vendor/qrcode-generator.js',
                [],
                YS_CHAT_WIDGETS_VERSION,
                [ 'in_footer' => true, 'strategy' => 'defer' ]
            );
            $deps[] = 'ys-chat-qrcode';
        }

        wp_enqueue_script(
            'ys-chat-widgets',
            YS_CHAT_WIDGETS_PLUGIN_URL . 'assets/js/ys-chat-frontend.js',
            $deps,
            YS_CHAT_WIDGETS_VERSION,
            [ 'in_footer' => true, 'strategy' => 'defer' ]
        );

        wp_localize_script( 'ys-chat-widgets', 'ysChatWidgets', [
            'mode' => ( 'popup' === ( $settings['mode'] ?? 'redirect' ) ) ? 'popup' : 'redirect',
            'i18n' => [
                'scanQr'   => __( '用手機掃描 QR Code', 'ys-chat-widgets' ),
                'openLink' => __( '直接開啟', 'ys-chat-widgets' ),
                'close'    => __( '關閉', 'ys-chat-widgets' ),
            ],
        ] );
    }

    /**
     * 輸出浮動按鈕 HTML
     */
    public function render_widget(): void {
        $settings = YSChatWidgets::get_settings();
        if ( ! $this->should_render( $settings ) ) {
            return;
        }

        $position = ( 'left' === ( $settings['position'] ?? 'right' ) ) ? 'left' : 'right';
        $bottom   = max( 0, (int) ( $settings['bottom'] ?? 30 ) );
        $side     = max( 0, (int) ( $settings['side'] ?? 20 ) );
        $color    = (string) ( $settings['button_color'] ?? '#8fa8b8' );
        if ( ! preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', $color ) ) {
            $color = '#8fa8b8';
        }
        $btn_icon = (string) ( $settings['button_icon'] ?? '' );
        $tooltip  = (string) ( $settings['tooltip'] ?? 'appname' );
        $defs     = YSChatApps::all();
        $toggle_fg = YSChatApps::contrast_fg( $color );

        $style = sprintf(
            '--ysch-bottom:%dpx;--ysch-side:%dpx;--ysch-color:%s;',
            $bottom,
            $side,
            $color
        );

        // 關鍵樣式一律 inline + !important（CSS 優先級最高）— 不論主題 CSS 多強勢
        // （含 Elementor 系常見的 button !important 重置）、或 CDN 快取殘留舊樣式，
        // 主按鈕與 app 圖示的圓形底色、尺寸、圖示顏色都不會被蓋掉。
        $toggle_inline = 'position:relative!important;box-sizing:border-box!important;display:flex!important;'
            . 'align-items:center!important;justify-content:center!important;'
            . 'width:56px!important;height:56px!important;min-width:56px!important;padding:0!important;margin:0!important;'
            . 'border:none!important;border-radius:50%!important;background:' . $color . '!important;color:' . $toggle_fg . '!important;'
            . 'cursor:pointer!important;line-height:0!important;box-shadow:0 4px 14px rgba(0,0,0,0.22)!important;'
            . '-webkit-appearance:none!important;appearance:none!important;';
        $swap_inline = 'position:absolute!important;inset:0!important;display:flex!important;'
            . 'align-items:center!important;justify-content:center!important;margin:0!important;';
        ?>
<div id="ys-chat-widgets" class="ysch-wrap ysch-pos-<?php echo esc_attr( $position ); ?>" data-mode="<?php echo esc_attr( ( 'popup' === ( $settings['mode'] ?? 'redirect' ) ) ? 'popup' : 'redirect' ); ?>" style="<?php echo esc_attr( $style ); ?>">
    <ul class="ysch-items" role="list">
        <?php
        foreach ( (array) $settings['apps'] as $app ) {
            if ( empty( $app['key'] ) || ! isset( $app['value'] ) || '' === trim( (string) $app['value'] ) ) {
                continue;
            }
            $key = (string) $app['key'];
            $def = $defs[ $key ] ?? $defs['custom'];
            $url = YSChatApps::build_url( $key, (string) $app['value'] );
            if ( '' === $url ) {
                continue;
            }

            $label = ! empty( $app['title'] ) ? (string) $app['title'] : (string) $def['title'];
            if ( 'content' === $tooltip ) {
                $label = (string) $app['value'];
            }

            // tel:/mailto: 等本地 scheme 不需要新分頁。
            $is_external = (bool) preg_match( '#^https?://#i', $url );
            ?>
        <li class="ysch-item-row">
            <a class="ysch-item ysch-app-<?php echo esc_attr( $key ); ?>"
               href="<?php echo esc_url( $url ); ?>"
               <?php echo $is_external ? 'target="_blank" rel="noopener nofollow"' : ''; ?>
               data-app="<?php echo esc_attr( $key ); ?>"
               data-applabel="<?php echo esc_attr( ! empty( $app['title'] ) ? (string) $app['title'] : (string) $def['title'] ); ?>"
               data-appvalue="<?php echo esc_attr( (string) $app['value'] ); ?>"
               data-appcolor="<?php echo esc_attr( $def['color'] ); ?>"
               data-appfg="<?php echo esc_attr( $def['icon_fg'] ); ?>"
               style="--ysch-app-color:<?php echo esc_attr( $def['color'] ); ?>;--ysch-app-fg:<?php echo esc_attr( $def['icon_fg'] ); ?>;text-decoration:none;">
                <span class="ysch-icon" aria-hidden="true" style="box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;width:46px!important;height:46px!important;min-width:46px!important;border-radius:50%!important;background:<?php echo esc_attr( $def['color'] ); ?>!important;color:<?php echo esc_attr( $def['icon_fg'] ); ?>!important;flex:0 0 auto!important;line-height:0!important;"><?php echo YSChatApps::icon( $key ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
                <span class="ysch-label"><?php echo esc_html( $label ); ?></span>
            </a>
        </li>
            <?php
        }
        ?>
    </ul>
    <button type="button" class="ysch-toggle" aria-expanded="false" aria-controls="ys-chat-widgets"
            style="<?php echo esc_attr( $toggle_inline ); ?>"
            aria-label="<?php echo esc_attr__( '開啟聯絡選單', 'ys-chat-widgets' ); ?>">
        <?php if ( $btn_icon ) : ?>
            <?php
            $icon_style = ( 'cover' === ( $settings['icon_style'] ?? 'contain' ) ) ? 'cover' : 'contain';
            $img_inline = ( 'cover' === $icon_style )
                ? 'width:100%!important;height:100%!important;border-radius:50%!important;object-fit:cover!important;display:block!important;'
                : 'width:60%!important;height:60%!important;border-radius:0!important;object-fit:contain!important;display:block!important;';
            ?>
            <span class="ysch-toggle-open ysch-toggle-img ysch-icon-<?php echo esc_attr( $icon_style ); ?>" style="<?php echo esc_attr( $swap_inline ); ?>"><img src="<?php echo esc_url( $btn_icon ); ?>" alt="" loading="lazy" style="<?php echo esc_attr( $img_inline ); ?>" /></span>
        <?php else : ?>
            <span class="ysch-toggle-open" style="<?php echo esc_attr( $swap_inline ); ?>"><?php echo YSChatApps::toggle_icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
        <?php endif; ?>
        <span class="ysch-toggle-close" style="<?php echo esc_attr( $swap_inline ); ?>opacity:0;"><?php echo YSChatApps::close_icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
    </button>
</div>
        <?php
    }
}
