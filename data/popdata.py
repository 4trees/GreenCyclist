import csv
import re



with open('trip.csv','rb') as csvFile1:
	reader=csv.reader(csvFile1)
	rows=[row1 for row1 in reader]
	# firstrow=rows[0]
	with open('tripbysec.csv','w+') as csvFile2:
		writer = csv.writer(csvFile2)
		# writer.writerow(firstrow+['Location']) 
		writer.writerow(['time','duration','people'])		
		for row in rows:
			time=row
			duration=
			people=
			writer.writerow([time,duration,people])


