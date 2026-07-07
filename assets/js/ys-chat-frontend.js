/**
 * YS CHAT Widgets — 前端互動（vanilla JS）
 *
 * 兩種點擊模式：
 * - redirect：App 為純 <a> 錨點，點擊直接開啟（預設）。
 * - popup：桌機點擊改彈「QR Code 卡片」— QR 由本地 JS 生成（canvas/dataURL），
 *   零 iframe、零外部請求；手機仍直接開啟連結（自己掃自己沒有意義）。
 *
 * 本檔不做任何自動導向、不自動開任何視窗 — 一切都由使用者點擊觸發。
 *
 * @since 1.1.0
 */
( function () {
    'use strict';

    var MOBILE_QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse)';

    function isMobileLike() {
        try {
            return window.matchMedia( MOBILE_QUERY ).matches;
        } catch ( e ) {
            return false;
        }
    }

    function i18n( key, fallback ) {
        try {
            return ( window.ysChatWidgets && window.ysChatWidgets.i18n && window.ysChatWidgets.i18n[ key ] ) || fallback;
        } catch ( e ) {
            return fallback;
        }
    }

    /* ── QR 卡片 ─────────────────────────── */

    var overlay = null;

    function closeQrCard() {
        if ( overlay && overlay.parentNode ) {
            overlay.parentNode.removeChild( overlay );
        }
        overlay = null;
        document.removeEventListener( 'keydown', onEscClose, true );
    }

    function onEscClose( e ) {
        if ( 'Escape' === e.key ) {
            closeQrCard();
        }
    }

    /**
     * 開啟 QR 卡片
     *
     * @param {Object} data { url, label, value, color, fg }
     */
    function openQrCard( data ) {
        if ( 'function' !== typeof window.qrcode ) {
            // QR 生成器未載入 → 直接放行開連結（漸進降級）。
            window.open( data.url, '_blank', 'noopener' );
            return;
        }

        closeQrCard();

        // 本地生成 QR（type 0 = 自動選擇容量，M 級容錯）。
        var dataUrl = '';
        try {
            var qr = window.qrcode( 0, 'M' );
            qr.addData( data.url );
            qr.make();
            dataUrl = qr.createDataURL( 6, 12 );
        } catch ( e ) {
            window.open( data.url, '_blank', 'noopener' );
            return;
        }

        overlay = document.createElement( 'div' );
        overlay.className = 'ysch-qr-overlay';

        var card = document.createElement( 'div' );
        card.className = 'ysch-qr-card';
        card.setAttribute( 'role', 'dialog' );
        card.setAttribute( 'aria-label', data.label );

        var header = document.createElement( 'div' );
        header.className = 'ysch-qr-header';
        header.style.background = data.color;
        header.style.color = data.fg;

        var title = document.createElement( 'span' );
        title.className = 'ysch-qr-title';
        title.textContent = data.label;
        header.appendChild( title );

        var closeBtn = document.createElement( 'button' );
        closeBtn.type = 'button';
        closeBtn.className = 'ysch-qr-close';
        closeBtn.setAttribute( 'aria-label', i18n( 'close', 'Close' ) );
        closeBtn.innerHTML = '&#10005;';
        closeBtn.style.color = data.fg;
        closeBtn.addEventListener( 'click', closeQrCard );
        header.appendChild( closeBtn );
        card.appendChild( header );

        var body = document.createElement( 'div' );
        body.className = 'ysch-qr-body';

        var img = document.createElement( 'img' );
        img.className = 'ysch-qr-img';
        img.alt = 'QR Code — ' + data.label;
        img.src = dataUrl;
        body.appendChild( img );

        var hint = document.createElement( 'p' );
        hint.className = 'ysch-qr-hint';
        hint.textContent = i18n( 'scanQr', 'Scan with your phone' );
        body.appendChild( hint );

        if ( data.value ) {
            var val = document.createElement( 'p' );
            val.className = 'ysch-qr-value';
            val.textContent = data.value;
            body.appendChild( val );
        }

        var open = document.createElement( 'a' );
        open.className = 'ysch-qr-open';
        open.href = data.url;
        if ( /^https?:\/\//i.test( data.url ) ) {
            open.target = '_blank';
            open.rel = 'noopener nofollow';
        }
        open.style.background = data.color;
        open.style.color = data.fg;
        open.textContent = i18n( 'openLink', 'Open directly' );
        body.appendChild( open );

        card.appendChild( body );
        overlay.appendChild( card );

        // 點 backdrop 關閉（點卡片本身不關）。
        overlay.addEventListener( 'click', function ( e ) {
            if ( e.target === overlay ) {
                closeQrCard();
            }
        } );
        document.addEventListener( 'keydown', onEscClose, true );

        document.body.appendChild( overlay );
        closeBtn.focus();
    }

    /* ── 初始化 ───────────────────────────── */

    function init() {
        var wrap = document.getElementById( 'ys-chat-widgets' );
        if ( ! wrap ) {
            return;
        }
        var toggle = wrap.querySelector( '.ysch-toggle' );
        if ( ! toggle ) {
            return;
        }

        function setOpen( open ) {
            wrap.classList.toggle( 'ysch-open', open );
            toggle.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
        }

        toggle.addEventListener( 'click', function () {
            setOpen( ! wrap.classList.contains( 'ysch-open' ) );
        } );

        // 點擊外部收合。
        document.addEventListener( 'click', function ( e ) {
            if ( wrap.classList.contains( 'ysch-open' ) && ! wrap.contains( e.target ) ) {
                setOpen( false );
            }
        } );

        // Esc 收合。
        document.addEventListener( 'keydown', function ( e ) {
            if ( 'Escape' === e.key && wrap.classList.contains( 'ysch-open' ) && ! overlay ) {
                setOpen( false );
                toggle.focus();
            }
        } );

        // popup（QR）模式：桌機攔截 App 點擊 → 彈 QR 卡片；手機放行直接開。
        if ( 'popup' === wrap.getAttribute( 'data-mode' ) ) {
            wrap.addEventListener( 'click', function ( e ) {
                var item = e.target && e.target.closest ? e.target.closest( '.ysch-item' ) : null;
                if ( ! item || isMobileLike() ) {
                    return; // 手機或非 App 點擊 → 原生錨點行為。
                }
                e.preventDefault();
                openQrCard( {
                    url:   item.getAttribute( 'href' ),
                    label: item.getAttribute( 'data-applabel' ) || '',
                    value: item.getAttribute( 'data-appvalue' ) || '',
                    color: item.getAttribute( 'data-appcolor' ) || '#8fa8b8',
                    fg:    item.getAttribute( 'data-appfg' ) || '#ffffff',
                } );
            } );
        }
    }

    if ( 'loading' === document.readyState ) {
        document.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }
} )();
