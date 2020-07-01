-- ## kpex ##
-- @file exaples/relation-mysql/employees_create_db.sql
-- @author Tomas Kavan <tomas.kavan@melowntech.com>
-- @brief DB and User create. In case you don't have database yet.

SET NAMES 'utf8';

-- Cleanup
DROP DATABASE IF EXISTS `kpex_rel_test`;
DROP USER IF EXISTS 'kpexreltest'@'%';
DROP USER IF EXISTS 'kpexreltest'@'localhost';

-- Create database
CREATE DATABASE `kpex_rel_test`
  CHARACTER SET 'utf8'
  COLLATE 'utf8_general_ci';

-- Create user
CREATE USER 'kpexreltest'@'%'
  IDENTIFIED WITH mysql_native_password BY 'kpex';
CREATE USER 'kpexreltest'@'localhost'
  IDENTIFIED WITH mysql_native_password BY 'kpex';

-- Grant privileges
GRANT ALL ON `kpex_rel_text`.* TO 'kpexreltest'@'%';
GRANT ALL ON `kpex_rel_text`.* TO 'kpexreltest'@'localhost';

FLUSH PRIVILEGES;
