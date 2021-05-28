DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS dogs;
DROP TABLE IF EXISTS breeds;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS subbreeds;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  breed TEXT UNIQUE NOT NULL
);

CREATE TABLE subbreeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subbreed TEXT UNIQUE NOT NULL
);

CREATE TABLE photos (
  id INTEGER,
  photo TEXT UNIQUE NOT NULL,
  FOREIGN KEY (id) REFERENCES dogs (id)
);

CREATE TABLE dogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dogname TEXT UNIQUE NOT NULL,
  nick TEXT,
  gender TEXT NOT NULL,
  birthday TIMESTAMP,
  breed INTEGER,
  subbreed INTEGER,
  suit TEXT,
  mam INTEGER,
  dad INTEGER,
  FOREIGN KEY (breed) REFERENCES breeds (id),
  FOREIGN KEY (subbreed) REFERENCES subbreeds (id),
  FOREIGN KEY (mam) REFERENCES dogs (id),
  FOREIGN KEY (dad) REFERENCES dogs (id)
);

INSERT INTO breeds (breed)
VALUES ( 'Чихуахуа'),
       ( 'Шпиц');

INSERT INTO subbreeds (subbreed)
VALUES ( 'Длиношёрстная'),
       ( 'Той-шпиц'),
       ( 'Малый шпиц');
