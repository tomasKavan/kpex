-- ## kpex ##
-- @file exaples/relation-mysql/employees.sql
-- @author Tomas Kavan <tomas.kavan@melowntech.com>
-- @brief DB Initialization SQL file related to example showing
--        relations cappabilites of kpex module

SET NAMES 'utf8';

-- Database creation


-- User creation and granting rigths

-- Cleanup (in case wthe database already existed)

SET foreign_key_checks = 0;

DROP TABLE IF EXISTS `employee`;
DROP TABLE IF EXISTS `project`;
DROP TABLE IF EXISTS `project_employee`;

SET foreign_key_checks = 1;

-- Table employee
CREATE TABLE `employee` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `surname` VARCHAR(255) NOT NULL,
  `position` VARCHAR(255) NOT NULL,
  `line_manager` INT,

  CONSTRAINT `employee_pk_id` PRIMARY KEY (`id`),
  CONSTRAINT `employee_fk_linemanager` FOREIGN KEY (`id`)
    REFERENCES `employee` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = 'InnoDB';

-- Table project
CREATE TABLE `project` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL DEFAULT '',
  `running` BOOLEAN NOT NULL DEFAULT TRUE,
  `manager` INT NOT NULL,

  CONSTRAINT `project_pk_id` PRIMARY KEY (`id`),
  CONSTRAINT `project_fk_manager` FOREIGN KEY (`manager`)
    REFERENCES `employee` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE
) ENGINE = 'InnoDB';

-- Table project_employee
-- M:N Binding table
CREATE TABLE `project_employee` (
  `project` INT NOT NULL,
  `employee` INT NOT NULL,

  CONSTRAINT `projectemployee_pk` PRIMARY KEY (`project`, `employee`),
  CONSTRAINT `projectemployee_fk_project` FOREIGN KEY (`project`)
    REFERENCES `project` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `projectemployee_fk_employee` FOREIGN KEY (`employee`)
    REFERENCES `employee` (`id`)
    ON DELETE CASCADE,
    ON UPDATE CASCADE
) ENGINE = 'InnoDB'
