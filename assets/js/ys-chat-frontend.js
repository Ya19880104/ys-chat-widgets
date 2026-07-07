/**
 * YS CHAT Widgets — 前端互動（vanilla JS）
 *
 * 僅做展開/收合。所有 App 都是純 <a> 錨點，
 * 本檔不做任何導向、不開任何視窗 — 零自動觸發。
 *
 * @since 1.0.0
 */
( function () {
    'use strict';

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
            if ( 'Escape' === e.key && wrap.classList.contains( 'ysch-open' ) ) {
                setOpen( false );
                toggle.focus();
            }
        } );
    }

    if ( 'loading' === document.readyState ) {
        document.addEventListener( 'DOMContentLoaded', init );
    } else {
        init();
    }
} )();
