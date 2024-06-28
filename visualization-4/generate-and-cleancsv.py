import csv 

file1 = []

# Open the CSV file
with open('daily-per-capita-supply-of-calories-vs-gdp-per-capita.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        file1.append(row)

data = []

for i in file1:
    if int(i['Year']) >= 1990:
        data.append({"Country": i['Entity'],"Code" : i['Code'], "Year" : i['Year'], "GDP" : i['GDP per capita, PPP (constant 2017 international $)']})


with open('daily-caloric-supply-derived-from-carbohydrates-protein-and-fat.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        for i in data:
            if row['Code'] == i['Code'] and int(row['Year']) == int(i['Year']):
                i['Animal Protein'] = str(round(float(row['Animal Protein']),2))
                i['Vegetal Protein'] = str(round(float(row['Vegetal Protein']),2))
                i['Carbohydrates'] = str(round(float(row['Carbohydrates']),2))
                i['Fat'] = str(round(float(row['Fat']),2))
                i['Calories'] = str(round((float(row['Animal Protein']) + float(row['Vegetal Protein']) + float(row['Carbohydrates']) + float(row['Fat'])),2))


with open('composition-of-diet-vs-gdp-per-capita.csv', 'w', newline='') as csvfile:
    fieldnames = ['Country','Code', 'Year', 'GDP', 'Animal Protein', 'Vegetal Protein', 'Carbohydrates', 'Fat', 'Calories']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for i in data:
        writer.writerow(i)
print("Saved Raw Data")

count = 0
clean_rows = []

with open('composition-of-diet-vs-gdp-per-capita.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['GDP'] == '' or row['Animal Protein'] == '' or row['Vegetal Protein'] == '' or row['Carbohydrates'] == '' or row['Fat'] == '' or row['Code'] == '' or row['Year'] == '':
            count += 1
        else:
            clean_rows.append(row)

print("Number of erroneous rows:", count)

# Write the clean rows back to the same file
with open('composition-of-diet-vs-gdp-per-capita.csv', 'w', newline='') as csvfile:
    fieldnames = ['Country','Code', 'Year', 'GDP', 'Animal Protein', 'Vegetal Protein', 'Carbohydrates', 'Fat', 'Calories']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    writer.writerows(clean_rows)

print("Clean data has been saved back to the file.")