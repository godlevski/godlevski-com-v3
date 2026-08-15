-- Migration number: 0002 	 slides + tags (ported from mongo Slide/Tag models)
CREATE TABLE IF NOT EXISTS slides (
  id TEXT PRIMARY KEY,              -- mongo _id hex, preserved through the import
  public_id TEXT NOT NULL,
  project TEXT NOT NULL,
  client TEXT NOT NULL,
  tools TEXT,
  date TEXT NOT NULL,               -- ISO 8601
  image TEXT NOT NULL,              -- filename under files/slides/originals/
  image_width INTEGER,
  image_height INTEGER,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,              -- mongo _id hex
  slide_id TEXT NOT NULL REFERENCES slides(id),
  tagname TEXT NOT NULL,
  -- area box, % of image dimensions
  sxp REAL NOT NULL DEFAULT 0,
  syp REAL NOT NULL DEFAULT 0,
  exp REAL NOT NULL DEFAULT 100,
  eyp REAL NOT NULL DEFAULT 100,
  -- order within the slide's tag list (mongo array order)
  position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tags_slide_id ON tags(slide_id);
