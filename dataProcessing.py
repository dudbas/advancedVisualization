#CSE 332 James Lam
#LAB 3 

import pandas as pd
from flask_cors import CORS, cross_origin
from flask import Flask
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
df = pd.read_csv('https://raw.githubusercontent.com/dudbas/Database-Visualization/main/DMVFusion.csv',parse_dates=[1,2])
datanames=['crash_date','crash_time','on_street','contributing_factor_vehicle_1','contributing_factor_vehicle_2','order_type','sign_code','sign_description']
factorization=df.apply(lambda x : pd.factorize(x)[0])
correlation=factorization.corr(method='pearson', min_periods=1)
correlation.drop('borough', inplace=True, axis=1)
correlation.drop('borough', inplace=True, axis=0)
#For Scatter

scatteration=pd.DataFrame.sum(correlation)
#For Correlation
#PCA
correlationPCAw,correlationPCAv=np.linalg.eig(correlation.apply(pd.to_numeric))


x = factorization.loc[:, datanames].values
x = StandardScaler().fit_transform(x)

mds=MDS(random_state=0)
mdsData=mds.fit_transform(x[:300])

mdsAttribute=mds.fit_transform(correlation.abs().apply(lambda x:1-x))

pcaobj = PCA(n_components=8)
pc=pcaobj.fit_transform(x)


principalDf = pd.DataFrame(data = pc, columns = ['PC1','PC2','PC3','PC4','PC5','PC6','PC7','PC8'])
#finalDf = pd.concat([principalDf, df[['sign_code']]], axis = 1)
#FOR CORRELATION----
correlation.reset_index(inplace=True)
correlation1=correlation.melt(id_vars='index',var_name="x",value_name="data")
#For Scatter + Parallel
scatteration1=scatteration.sort_values(ascending=False)
scatteration1=scatteration1.iloc[:5]
top5=list(scatteration1.index.values)

@app.route("/correlation")
@cross_origin()
def corr():
     return correlation1.to_csv()

@app.route("/scatter")
@cross_origin()
def scatt():
     factorization1=factorization.clip(upper=15) 
     factorization1=factorization1[top5]
     return factorization1.iloc[:4054].to_csv()

@app.route("/parallel")
@cross_origin()
#First selection set to crash_date, then crash_date looks for next best and adds to list, which then looks for next best.....
#rev ['order_type', 'contributing_factor_vehicle_2', 'contributing_factor_vehicle_1', 'crash_time', 'crash_date', 'on_street', 'sign_description', 'sign_code'] 
def para():
     ordering=['sign_description','sign_code','on_street','order_type','contributing_factor_vehicle_2','contributing_factor_vehicle_1','crash_date','crash_time']
     ddf =factorization.clip(upper=20)[ordering]
     return ddf.iloc[:4054].to_csv()
     
     
@app.route("/pca")
@cross_origin()
def pcaa():
     return pd.concat([principalDf.iloc[:,0:2], df[['order_type']]],axis=1).to_csv()
     
@app.route("/scree")
@cross_origin()
def scree():
     temp = pd.DataFrame(np.sort(correlationPCAw,axis=None)[::-1]).rename_axis(index='index')
     temp.rename(columns={temp.columns[0]:'value'},inplace=True)
     return temp.to_csv()

@app.route("/bi")
@cross_origin()
def bi():
     print(correlationPCAv)
     temp =pd.DataFrame(data=correlationPCAv,columns = ['PC1','PC2','PC3','PC4','PC5','PC6','PC7','PC8']).iloc[:,0:2].rename_axis(index='index')
     temp.rename(columns={temp.columns[0]:'PC1'},inplace=True)
     temp.rename(columns={temp.columns[1]:'PC2'},inplace=True)
     temp = pd.concat([temp.iloc[:,0:2], pd.Series(datanames)],axis=1)
     temp.rename(columns={temp.columns[2]:'index'},inplace=True)
     return  temp.to_csv()
@app.route("/mdata")
@cross_origin()
def mData():
     return pd.DataFrame(data=mdsData, columns=['x','y']).to_csv()
@app.route("/mAttributes")
@cross_origin()
def mAtt():
     return pd.concat([pd.DataFrame(data=mdsAttribute, columns=['x','y']),pd.DataFrame(data=datanames,columns=['attributes'])],axis=1).to_csv()
app.run()