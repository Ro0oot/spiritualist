import requests
import json
import re

"""
AK = 'Z3in0KEYy85ZHxF1bbtY6ur5I1riLzmR'
address = 'London'
url = 'http://api.map.baidu.com/geocoding/v3/?address={}&output=json&ak={}&callback=showLocation'.format(address, AK)
res = requests.get(url)

print(res.text)
results = json.loads(re.findall(r'\((.*?)\)', res.text)[0])

print('\n')
print('location is ', results['result']['location'])
"""
import pandas as pd
import numpy as np
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent='myuseragent')
df = pd.read_csv('1869.csv')
coor = []
ty = []
for x in df.index:
    city = df.loc[x, "City"]
    location = geolocator.geocode(city)
    coordinates = [location.latitude, location.longitude]
   # print(coordinates)
   # print(type(coordinates))
    coor.append(coordinates)
    ty.append('Point')
# print(location.latitude, location.longitude)
df['coordinates'] = coor
df['type'] = ty
#print(type(df.loc[3]['coordinates']))
df.to_excel('69.xls')
