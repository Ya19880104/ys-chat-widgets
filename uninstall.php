<?php
/**
 * 解除安裝 — 移除資料表與 options
 *
 * @package YangSheep\ChatWidgets
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;

// 移除設定資料表。
$table = $wpdb->prefix . 'ys_chat_widgets_settings';
// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
$wpdb->query( "DROP TABLE IF EXISTS {$table}" );

// 移除 options。
delete_option( 'ys_chat_widgets_schema_version' );
delete_option( 'ys_chat_widgets_migrated' );
delete_transient( 'ys_chat_widgets_migration_notice' );
