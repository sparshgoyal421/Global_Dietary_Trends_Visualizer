import csv
import pycountry

# Input and output file paths
input_file = "viz-5-temp.csv"
output_file = "output.csv"

# Read the input CSV file
with open(input_file, "r") as csv_file:
    reader = csv.reader(csv_file)
    data = list(reader)

# Replace country codes with continent names
header = data[0]
header[1] = "Continent"
for row in data[1:]:
    code = row[1]
    try:
        country = pycountry.countries.get(alpha_3=code)
        continent = pycountry.continents.get(alpha_2=country.alpha_2).name
        row[1] = continent
    except (KeyError, AttributeError):
        row[1] = "Unknown"

# Write the updated data to the output CSV file
with open(output_file, "w", newline="") as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow(header)
    writer.writerows(data[1:])

print(f"Output file created: {output_file}")