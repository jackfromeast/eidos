---
title: 文档
description: 您思想的栖息地
sidebar:
  order: 1
---

文档是 Eidos 的核心。它们是您思考、写作和捕捉想法的地方。但与典型的文字处理器不同，这些文档被设计为与您的其余数据良好配合。

把它们想象成知道自己是更大系统一部分的智能文本容器。

## 我们如何存储您的文字

Eidos 中的每个文档都存在于一个名为 `eidos__docs` 的表中。如果您习惯于将文档视为文件，这可能看起来很奇怪，但有充分的理由。

当您的文档在数据库中时，它们变得可查询。您可以立即搜索所有写作内容。您可以在文档之间创建链接。您甚至可以编写脚本来分析您的写作模式或从您的笔记中提取信息。

以下是底层存储的样子：

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

## 每个字段的含义

| 字段       | 类型      | 用途 |
| ----------- | --------- | ------------- |
| id          | TEXT      | 每个文档的唯一指纹 |
| content     | TEXT      | Lexical 格式的富内容（编辑器使用的格式） |
| is_day_page | boolean   | 这是否是日常日记页面 |
| markdown    | TEXT      | 用于导出和互操作性的 markdown 版本 |
| created_at  | timestamp | 您首次开始此文档的时间 |
| updated_at  | timestamp | 您最后一次修改它的时间 |

巧妙之处在于以两种格式存储内容。`content` 字段保存使编辑流畅的富结构化格式。`markdown` 字段为您提供可移植性——您始终可以以几十年后仍然可读的格式导出您的想法。

日常页面通过 `is_day_page` 标记获得特殊处理。这些是与特定日期绑定的文档，非常适合日记或日常笔记。系统知道在您浏览或搜索时以不同方式处理它们。 