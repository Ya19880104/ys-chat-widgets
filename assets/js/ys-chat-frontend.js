/**
 * YS CHAT Widgets — 前端互動（vanilla JS）
 *
 * 兩種點擊模式：
 * - redirect：App 為純 <a> 錨點，點擊直接開啟（預設）。
 * - popup：桌機點擊在「widget 同側角落」彈出 QR Code 卡片（與傳統
 *   click-to-chat 外掛相同的角落彈窗，非全螢幕置中）— QR 由本地 JS
 *   生成，零 iframe、零外部請求；手機仍直接開啟連結。
 *
 * 卡片樣式全部 inline（不依賴 CSS 檔）— 避免 CDN 快取舊樣式造成跑版。
 * 本檔不做任何自動導向、不自動開任何視窗 — 一切都由使用者點擊觸發。
 *
 * @since 1.1.4
 */
( function () {
    'use strict';

    var MOBILE_QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse)';
    var FONT_STACK   = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans TC",sans-serif';

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

    /** 批次設定 inline style。 */
    function css( el, styles ) {
        for ( var k in styles ) {
            el.style[ k ] = styles[ k ];
        }
    }

    /* ── QR 卡片（widget 同側角落彈出） ────── */

    var qrCard = null;

    function closeQrCard() {
        if ( qrCard && qrCard.parentNode ) {
            qrCard.parentNode.removeChild( qrCard );
        }
        qrCard = null;
        document.removeEventListener( 'keydown', onEscClose, true );
        document.removeEventListener( 'click', onOutsideClose, true );
    }

    function onEscClose( e ) {
        if ( 'Escape' === e.key ) {
            closeQrCard();
        }
    }

    function onOutsideClose( e ) {
        if ( qrCard && ! qrCard.contains( e.target ) ) {
            closeQrCard();
        }
    }

    /**
     * 開啟 QR 卡片（錨定在 widget 同側角落）
     *
     * @param {Object} data { url, label, value, color, fg, anchor }
     */
    function openQrCard( data ) {
        if ( 'function' !== typeof window.qrcode ) {
            window.open( data.url, '_blank', 'noopener' );
            return;
        }

        closeQrCard();

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

        // 錨定位置：與 widget 同側、疊在 toggle 上方。
        var a      = data.anchor;
        var isLeft = 'left' === a.side;

        qrCard = document.createElement( 'div' );
        qrCard.setAttribute( 'role', 'dialog' );
        qrCard.setAttribute( 'aria-label', data.label );
        css( qrCard, {
            position: 'fixed',
            bottom: ( a.bottom + a.toggleH + 14 ) + 'px',
            width: '272px',
            maxWidth: 'calc(100vw - 32px)',
            background: '#ffffff',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 10px 34px rgba(0,0,0,0.28)',
            zIndex: '99999',
            fontFamily: FONT_STACK,
            opacity: '0',
            transform: 'translateY(8px) scale(0.97)',
            transition: 'opacity 0.16s ease, transform 0.16s ease',
        } );
        qrCard.style[ isLeft ? 'left' : 'right' ] = a.side_px + 'px';

        var header = document.createElement( 'div' );
        css( header, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 14px',
            background: data.color,
            color: data.fg,
        } );

        var title = document.createElement( 'span' );
        title.textContent = data.label;
        css( title, { fontSize: '14px', fontWeight: '700', lineHeight: '1' } );
        header.appendChild( title );

        var closeBtn = document.createElement( 'button' );
        closeBtn.type = 'button';
        closeBtn.setAttribute( 'aria-label', i18n( 'close', 'Close' ) );
        closeBtn.innerHTML = '&#10005;';
        css( closeBtn, {
            border: 'none',
            background: 'transparent',
            color: data.fg,
            fontSize: '15px',
            lineHeight: '1',
            cursor: 'pointer',
            padding: '2px 4px',
            opacity: '0.85',
        } );
        closeBtn.addEventListener( 'click', closeQrCard );
        header.appendChild( closeBtn );
        qrCard.appendChild( header );

        var body = document.createElement( 'div' );
        css( body, {
            padding: '16px 16px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
        } );

        var img = document.createElement( 'img' );
        img.alt = 'QR Code — ' + data.label;
        img.src = dataUrl;
        css( img, {
            width: '184px',
            height: '184px',
            imageRendering: 'pixelated',
            border: '1px solid #edf1f4',
            borderRadius: '8px',
            display: 'block',
        } );
        body.appendChild( img );

        var hint = document.createElement( 'p' );
        hint.textContent = i18n( 'scanQr', 'Scan with your phone' );
        css( hint, { margin: '0', fontSize: '13px', color: '#2c3e50', fontWeight: '600' } );
        body.appendChild( hint );

        if ( data.value ) {
            var val = document.createElement( 'p' );
            val.textContent = data.value;
            css( val, {
                margin: '0',
                fontSize: '12px',
                color: '#7b8a96',
                wordBreak: 'break-all',
                textAlign: 'center',
                maxWidth: '100%',
            } );
            body.appendChild( val );
        }

        var open = document.createElement( 'a' );
        open.href = data.url;
        if ( /^https?:\/\//i.test( data.url ) ) {
            open.target = '_blank';
            open.rel = 'noopener nofollow';
        }
        open.textContent = i18n( 'openLink', 'Open directly' );
        css( open, {
            display: 'inline-block',
            marginTop: '2px',
            padding: '8px 20px',
            borderRadius: '18px',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
            background: data.color,
            color: data.fg,
        } );
        body.appendChild( open );

        qrCard.appendChild( body );
        document.body.appendChild( qrCard );

        // 入場動畫。
        requestAnimationFrame( function () {
            if ( qrCard ) {
                qrCard.style.opacity = '1';
                qrCard.style.transform = 'translateY(0) scale(1)';
            }
        } );

        // 點卡片外關閉（capture 延後掛避免吃到當下這次點擊）。
        setTimeout( function () {
            document.addEventListener( 'keydown', onEscClose, true );
            document.addEventListener( 'click', onOutsideClose, true );
        }, 0 );

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

        document.addEventListener( 'click', function ( e ) {
            if ( wrap.classList.contains( 'ysch-open' ) && ! wrap.contains( e.target ) && ! ( qrCard && qrCard.contains( e.target ) ) ) {
                setOpen( false );
            }
        } );

        document.addEventListener( 'keydown', function ( e ) {
            if ( 'Escape' === e.key && wrap.classList.contains( 'ysch-open' ) && ! qrCard ) {
                setOpen( false );
                toggle.focus();
            }
        } );

        // popup（QR）模式：桌機攔截 App 點擊 → 同側角落彈 QR 卡片；手機放行直接開。
        if ( 'popup' === wrap.getAttribute( 'data-mode' ) ) {
            wrap.addEventListener( 'click', function ( e ) {
                var item = e.target && e.target.closest ? e.target.closest( '.ysch-item' ) : null;
                if ( ! item || isMobileLike() ) {
                    return;
                }
                e.preventDefault();

                var cs = getComputedStyle( wrap );
                var isLeft = wrap.classList.contains( 'ysch-pos-left' );
                openQrCard( {
                    url:   item.getAttribute( 'href' ),
                    label: item.getAttribute( 'data-applabel' ) || '',
                    value: item.getAttribute( 'data-appvalue' ) || '',
                    color: item.getAttribute( 'data-appcolor' ) || '#8fa8b8',
                    fg:    item.getAttribute( 'data-appfg' ) || '#ffffff',
                    anchor: {
                        side:    isLeft ? 'left' : 'right',
                        side_px: parseInt( isLeft ? cs.left : cs.right, 10 ) || 20,
                        bottom:  parseInt( cs.bottom, 10 ) || 30,
                        toggleH: toggle.offsetHeight || 56,
                    },
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
