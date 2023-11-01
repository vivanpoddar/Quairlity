import requests, json
from googlesearch import search
from requests.exceptions import RequestException
from urllib3.exceptions import MaxRetryError
from requests.exceptions import SSLError

import lxml

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import codecs
import re
from webdriver_manager.chrome import ChromeDriverManager

training_data = []
websitesToScrape = []

for i in search("Healthy air quality", stop=1):
    websitesToScrape.append(i)

for i in search("Causes of bad air quality", stop=2):
    websitesToScrape.append(i)

for i in search("Effects of bad air quality", stop=1):
    websitesToScrape.append(i)

for i in search("How to improve air quality", stop=4):
    websitesToScrape.append(i)

for i in search("Characteristics of bad air quality", stop=2):
    websitesToScrape.append(i)

for i in websitesToScrape: print(i)

for i in websitesToScrape:
    try:
        res = requests.get(i)
    except (RequestException, SSLError, MaxRetryError) as e:
        print(f"Unable to access {i} due to {str(e)}. Skipping...")
        continue
    html_page = res.content
    soup = BeautifulSoup(html_page, 'lxml')
    text = soup.find_all(text=True)

    output = ''
    blacklist = [
        '[document]',
        'noscript',
        'header',
        'html',
        'meta',
        'head', 
        'input',
        'script',
        'style'
    ]

    for t in text:
        if t.parent.name not in blacklist:
            output += '{} '.format(t)

    training_data.append(output.encode('ascii', 'ignore').decode('unicode_escape')
)

with open('training_data.json', 'w') as f:
    for entry in training_data:
        f.write(json.dumps(entry) + '\n')

