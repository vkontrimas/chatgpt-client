CREATE TABLE note (
  id SERIAL NOT NULL,
  name TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL
);

CREATE USER huddle WITH PASSWORD 'huddle';
CREATE DATABASE huddle_development;
CREATE DATABASE huddle_test;
GRANT ALL PRIVILEGES ON DATABASE huddle_development TO huddle;
GRANT ALL PRIVILEGES ON DATABASE huddle_test TO huddle;
ALTER DATABASE huddle_development OWNER TO huddle;
ALTER DATABASE huddle_test OWNER TO huddle;
