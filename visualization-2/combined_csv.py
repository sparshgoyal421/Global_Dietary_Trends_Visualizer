import pandas as pd

# Specify the columns to select from each CSV file
columns_file1 = ['Entity', 'Mean BMI (male)', 'Year']
columns_file2 = ['Mean BMI (female)', 'Year']
columns_file3 = ['Daily caloric intake per person from carbohydrates', 'Daily caloric intake per person from fat', 'Year']

# Load only the specified columns from each CSV file
df3 = pd.read_csv('final.csv')
df1 = pd.read_csv('mean-body-mass-index-bmi-in-adult-males.csv')
df2 = pd.read_csv('mean-body-mass-index-bmi-in-adult-women.csv')

# # Filter rows with Year value as 2016
# df1 = df1[df1['Year'] == 2016]
# df2 = df2[df2['Year'] == 2016]
# df3 = df3[df3['Year'] == 2016]
df3_filtered = df3[(df3['Year'] >= 1975) & (df3['Year'] <= 2016)]
df3_filtered = df3_filtered[['Entity', 'Year', 'Daily caloric intake per person from fat', 'Daily caloric intake per person from carbohydrates']]
# df3 = df3[(df3['Year'] >= 1975) & (df3['Year'] <= 2016)]

# # Filter rows with year between 1975 and 2016 for df1 and df2
# df1 = df1[(df1['Year'] >= 1975) & (df1['Year'] <= 2016)]
# df2 = df2[(df2['Year'] >= 1975) & (df2['Year'] <= 2016)]

# Merge the dataframes based on the 'Country' column
merged_df = pd.merge(df1, df2, on=['Entity','Year'], how='inner')
merged_df = pd.merge(merged_df, df3_filtered, on=['Entity', 'Year'], how='inner')

# Save the merged dataframe to a new CSV file
merged_df.to_csv('combined_data.csv', index=False)
