---
title: Documents
description: Where your thoughts live
sidebar:
  order: 1
---

Documents are the heart of Eidos. They're where you think, write, and capture ideas. But unlike a typical word processor, these documents are designed to play well with the rest of your data.

Think of them as smart text containers that know they're part of a larger system.

## How we store your words

Every document in Eidos lives in a table called `eidos__docs`. This might seem odd if you're used to thinking of documents as files, but there's a good reason for it.

When your documents are in a database, they become queryable. You can search across all your writing instantly. You can link between documents. You can even write scripts that analyze your writing patterns or extract information from your notes.

Here's what the storage looks like under the hood:

```sql
CREATE TABLE IF NOT EXISTS eidos__docs (
    id TEXT PRIMARY KEY,
    content TEXT,
    is_day_page BOOLEAN DEFAULT 0,
    markdown TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## What each field means

| Field       | Type      | What it's for |
| ----------- | --------- | ------------- |
| id          | TEXT      | Each document's unique fingerprint |
| content     | TEXT      | The rich content in Lexical format (what the editor uses) |
| is_day_page | boolean   | Whether this is a daily journal page |
| markdown    | TEXT      | A markdown version for export and interoperability |
| created_at  | timestamp | When you first started this document |
| updated_at  | timestamp | When you last touched it |

The clever bit is storing content in two formats. The `content` field holds the rich, structured format that makes editing smooth. The `markdown` field gives you portability—you can always export your thoughts in a format that will be readable decades from now.

Daily pages get special treatment with the `is_day_page` flag. These are documents tied to specific dates, perfect for journaling or daily notes. The system knows to handle them differently when you're browsing or searching.
