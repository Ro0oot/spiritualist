import geonamescache
import spacy
import os
import re
import pandas as pd
import nltk
import xlwt
from pathlib import Path

gc = geonamescache.GeonamesCache()

# gets nested dictionary for countries
countries = gc.get_countries()

# gets nested dictionary for cities
cities = gc.get_cities()


def gen_dict_extract(var, key):
    if isinstance(var, dict):
        for k, v in var.items():
            if k == key:
                yield v
            if isinstance(v, (dict, list)):
                yield from gen_dict_extract(v, key)
    elif isinstance(var, list):
        for d in var:
            yield from gen_dict_extract(d, key)


cities = [*gen_dict_extract(cities, 'name')]
countries = [*gen_dict_extract(countries, 'name')]
nlp = spacy.load("en_core_web_sm")

GPE_frame = pd.DataFrame(columns=['Name'])
GPEType = []
GPEName = []
ID = []

pre_path = '80/'
for filename in Path(pre_path).rglob("*.txt"):
#for filename in os.listdir('spiritualistNewspaper').rglob("*.txt"):
    #file_path = os.path.join(pre_path, filename)
    #print(file_path)
    with open(filename, 'r', encoding='utf-8') as f:
        data = f.read()
   # text = open(file_path, encoding='utf8')
        doc = nlp(data)

    for ent in doc.ents:
        if ent.label_ == 'GPE':
            if ent.text in cities:
                # print(f"City : {ent.text}")
                # GPEType.append('City')
                # ID.append(filename)
                GPEName.append(ent.text)

#GPE_frame['ID'] = ID
GPE_frame['Name'] = GPEName
#GPE_frame['Type'] = GPEType

GPE_frame.to_excel('1880.xls')
"""
text = open('135908617.txt')
doc = nlp(text.read())
GPEType = []
GPEName = []
for ent in doc.ents:
    if ent.label_ == 'GPE':
        if ent.text in countries:
            # print(f"Country : {ent.text}")
            GPEType.append('Country')
        elif ent.text in cities:
            # print(f"City : {ent.text}")
            GPEType.append('City')
        else:
            # print(f"Other GPE : {ent.text}")
            GPEType.append('OtherGPE')
        GPEName.append(ent.text)

GPE_frame = pd.DataFrame(columns=['Name', 'Type'])
GPE_frame['Name'] = GPEName
GPE_frame['Type'] = GPEType
print(GPE_frame)
"""