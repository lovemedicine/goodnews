# goodnews

a script that reads news feeds and filters out the sad stuff

## project outline

- existing sites

  - https://www.positive.news
  - https://goodnewsnetwork.org
  - https://www.onlygoodnewsdaily.com
  - https://www.goodgoodgood.co
  - https://www.huffpost.com/impact/topic/good-news

- choose labels

  - hopeful, neutral, sad, scary
  - good news, bad news, neutral news, not news
  - win, loss, neither, not news

- existing models
  - https://huggingface.co/facebook/bart-large-mnli
  - gemini 2.0 flash is free
- fine-tune model
  - create "dataset" (training and validation data)
    - find/compile US news leadlines
    - manually apply labels
  - fine-tune distilbert using dataset
- use hf inference api

- news article feed
  - from leading news sites
    - use rss feeds to get links
    - use archive.ph to get text if needed (rss might contain enough for labeling purposes)
  - create bluesky feed of news accounts
