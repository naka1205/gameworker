-- ----------------------------
-- Table structure for `too_rooms`
-- ----------------------------
DROP TABLE IF EXISTS `too_rooms`;
CREATE TABLE `too_rooms` (
  `rid` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `roomid` varchar(8) NOT NULL DEFAULT '' COMMENT '房间编号',
  `config` varchar(256) NOT NULL DEFAULT '' COMMENT '房间配置',
  `clients` varchar(256) NOT NULL DEFAULT '' COMMENT '用户信息',
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '状态',
  `create_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '创建用户',
  `create_time` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_time` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`rid`),
  KEY `roomid` (`roomid`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `too_users`
-- ----------------------------
DROP TABLE IF EXISTS `too_users`;
CREATE TABLE `too_users` (
  `uid` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `account` varchar(64) NOT NULL DEFAULT '' COMMENT '账号',
  `password` char(32) NOT NULL DEFAULT '' COMMENT '登录密码',
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '用户昵称',
  `sex` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '性别',
  `headimg` varchar(150) NOT NULL DEFAULT '' COMMENT '头像',
  `golds` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '用户金币',
  `cards` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '用户卡片',
  `roomid` varchar(8) NOT NULL DEFAULT '' COMMENT '房间编号',
  `create_time` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_time` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `account` (`account`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
