<template>
    
      <div class="mapview" style="height: 100%; width:100%;">
        <div
              id="select-by-polygon"
              class="esri-widget esri-widget--button esri-widget esri-interactive"
              title="Select features by rectangle"
              @click="polygonSelection">
            <span class="esri-icon-checkbox-unchecked"></span>
        </div>
        <div
              id="select-by-point"
              class="esri-widget esri-widget--button esri-widget esri-interactive"
              title="Select features by point">
            <span class="esri-icon-map-pin"></span>
        </div>
        <Dialog   :visible.sync="displayChart" position="topright" :containerStyle="{width: '50vw'}">
          <template #header>
            Charts
          </template>
          <Chart type="bar" :data="basicData" :options="basicOptions" />
        </Dialog>
        

      </div>

   


</template>


<script>

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer"
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer"
// import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer"
import Legend from "@arcgis/core/widgets/Legend"
import esriRequest from "@arcgis/core/request"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel"

import "flex-splitter-directive"
import "flex-splitter-directive/styles.min.css"
// import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition"
// import LayerList from "@arcgis/core/widgets/LayerList"

// import esriRequest from "@arcgis/core/request"

var baseurl = "https://ncdotsandbox.cnr.ncsu.edu/arcgis/rest/services/DemographicApp/DemographicAppWMS/MapServer/"


export default {
    name: "Map",
    props:{
      selectedGeoUnit:Object, 
      selectedSubjectArea: Object, 
      selectedTable: Object,
      selectedField: Object,
      selectedNormField: Object,
      selectedYear: Object, 
      normalize: Boolean,
      runQuery: Boolean
    },
    watch:{
      runQuery(){
        this.executeQuery();

      }

    },
    async mounted(){
        await this.loadMap()
    },
    methods:{
      openCharts(){
        this.displayChart = true
      },
        async polygonSelection(){
          this.view.graphics.removeAll();
          this.sketchViewModel.create("polygon")

        },
        async executeQuery(){
          this.geometry = this.makeLayer()
          // this.geometry = this.makeLayer()
          console.log(this.geometry) 
          this.map.layers = [this.geometry]
          this.renderLayer()
          // this.geometry = await this.makeGeometry();
          // this.attributes = await this.getAttributes()
          // this.map.layers = [this.geometry]
          // this.renderAttributes()

        },
        async get_historical_data(geo_id){
          var query;
          if (this.selectedGeoUnit.alias === "COUNTIES"){
            query = `geo_id = '${geo_id}' and geo_name LIKE '%County%'`
          }else{
            query = `geo_id = '${geo_id}'`
          }
          var options = {
            query: {
              where: query,
              outFields: ["*"],
              f: "json"
            },
            responseType: "json"
          };
          var response = await esriRequest(baseurl + `${this.selectedTable.id}\\query`, options)
          var chart_data = []
          if (this.normField){
            response.data.features.forEach(f =>{
              chart_data.push({
                year: new Date(f.attributes.year).getFullYear()+1,
                geo_name: f.attributes.geo_name,
                value: Number.parseFloat((f.attributes[this.selectedField.id]/f.attributes[this.selectedNormField.id] * 100)).toFixed(2)
              })
            })

          }else{
            response.data.features.forEach(f =>{
              chart_data.push({
                year:  new Date(f.attributes.year).getFullYear()+1,
                geo_name:f.attributes.geo_name,
                value: Number.parseFloat((f.attributes[this.selectedField.id]).toFixed(2))
              })
            });
          }
          
          return chart_data
        },
        async loadMap(){
            // var layer = await this.makeLayer(1, "Counties", "NCDOT_Demographics.dbo.B02001", "B02001_002", "Race|Total Population|White Alone", "2018", true, "B02001_001")

            
            // await this.renderLayer(layer, "NCDOT_Demographics.dbo.B02001", "B02001_002", false, "B02001_002", "NCDOT_Demographics.dbo.Counties", "Race|Total Population|White Alone",'2018' )
            // this.geometry = await this.makeGeometry();
            this.map = new Map({
                basemap: "gray",
                // layers: [this.geometry]
            })


            this.view =  new MapView({
                container: this.$el,
                map: this.map,
                center: [-79.59999218313682, 35.86808963573905],
                zoom: 8,            
            });
            var legend = new Legend({
              view: this.view,
            });
          this.view.ui.add(legend, "bottom-right");
          this.view.ui.add("select-by-polygon", "top-left");
          this.view.ui.add("select-by-point", "top-left");

          this.polygonGraphicsLayer = new GraphicsLayer();
          this.map.add(this.polygonGraphicsLayer);
          this.sketchViewModel = new SketchViewModel({
            view: this.view,
            layer: this.polygonGraphicsLayer,
            pointSymbol: {
              type: "simple-marker",
              style: "circle",
              color: "black",
              size: "6",
              outline: {
                color: "black",
                width: 1
              }
            }
          });


          // let layerlist = new LayerList({
          //   view: this.view
          // });
          // this.view.ui.add(layerlist, "top-right");
       
        },
         populationChange (feature) {
            var oid_field =`a_${this.selectedGeoUnit.alias}.OBJECTID`
            var name_field = `a_${this.selectedGeoUnit.alias}.NAME`
            var this_feature = this.selectedFeaturesData[feature.graphic.attributes[oid_field]]
              var div = document.createElement("div");
              if (this.selectedNormField){
                div.innerHTML = `
                Name: ${this_feature[name_field]} <br>
                Percent: ${(this_feature[this.statsField]/this_feature[this.normField] * 100).toPrecision(2)} %<br>
                Total: ${this_feature[this.statsField]} <br>
                Year: ${new Date(this_feature[this.yearField]).getFullYear() + 1}<br>
                GEOID: ${this_feature[this.geo_id_field]} <br>
              `
              }else{
                div.innerHTML = `
                  Name: ${this_feature[name_field]} <br>
                  Total: ${this_feature[this.statsField]} <br>
                  Year: ${new Date(this_feature[this.yearField]).getFullYear() + 1}<br>
                  GEOID: ${this_feature[this.geo_id_field]} <br>
                `

              }
             
              this.queryGeoLayers(this_feature[this.geo_id_field])
              console.log(feature)
              // // calculate the population percent change from 2010 to 2013.
              // var selectedGeoId = feature.graphic.attributes[`NCDOT_Demographics.DBO.${this.selectedTable.name}.geo_id`]
              // var selectedGeoName = feature.graphic.attributes[`NCDOT_Demographics.DBO.${this.selectedTable.name}.geo_name`]
              // var year = feature.graphic.attributes[`NCDOT_Demographics.DBO.${this.selectedTable.name}.year`]
              // this.queryGeoLayers(selectedGeoId);
              // console.log(new Date(year).getFullYear())
              // // queryGeoLayers(selectedGeoId);
              // // selectFeatures(feature.graphic.geometry.centroid, chart, false)
              // var fieldName = `NCDOT_Demographics.DBO.${this.selectedTable.name}.${this.selectedField.id}`
              // if(this.selectedNormField){
              //   var normFieldName = `NCDOT_Demographics.DBO.${this.selectedTable.name}.${this.selectedNormField.id}`
              //   let proportion = feature.graphic.attributes[fieldName] / feature.graphic.attributes[normFieldName] 
              //   let percent = proportion * 100
              //   div.innerHTML =
              //     `
              //     <b>${selectedGeoName}</b><br>
              //     ${this.selectedField.alias}: ${feature.graphic.attributes[fieldName]} <br>
              //     Total Population: ${feature.graphic.attributes[normFieldName]} <br>
              //     Percent: ${percent.toFixed(2)}<br>
              //     Year: ${new Date(year).getFullYear() + 1}
              //     `
              // }else{
              //   div.innerHTML =
              //     `<b>${selectedGeoName}</b><br>
              //     ${this.selectedField.alias}: ${feature.graphic.attributes[fieldName]} <br>
              //     Total Population: ${feature.graphic.attributes[fieldName]} <br>
              //     Year: ${new Date(year).getFullYear() + 1}
              //     `
              // }
              
              
              // console.log(div.innerHTML);
              this.view.popup.highlightEnabled = true
              return div;
              
            },
        
        async queryGeoLayers(geoid){

          // var tableAlias = this.selectedTable.alias 
          var geomValue = this.selectedGeoUnit.alias
          console.log(geomValue)
          var searchGeoms = ["37"]
          var countyId;
          if (geomValue === "BLOCKGROUPS"){
            var tractId = geoid.slice(0, -1)
            countyId = geoid.slice(0, -7)
            searchGeoms.push(tractId)
            searchGeoms.push(countyId)
          } else if (geomValue === "TRACTS"){
            countyId = geoid.slice(0, -6)
            searchGeoms.push(countyId)
          }
          var options = {
            query: {
              where: `geo_id in ('${searchGeoms.join("', '")}')`,
              outFields: ["*"],
              f: "json"
            },
            responseType: "json"
          };
          var response = await esriRequest(baseurl + `${this.selectedTable.id}\\query`, options)
          console.log(response)
          var compares = {
            "State" : {},
            "Counties" : {},
            "Tracts" : {}
          }
          response.data.features.forEach(f =>{
            try{
                if (f.attributes.geo_ida in compares[f.attributes.geo_unit] === false){
                  compares[f.attributes["geo_unit"]][f.attributes.geo_name] = [f]
                }else{
                  compares[f.attributes["geo_unit"]][f.attributes.geo_name].push(f)
                }
                
              } catch{
                console.log("fail")
              }
              });
              var new_data = await this.get_historical_data(geoid)
              this.updateChart(new_data)
              this.displayChart = true;

          

            // var compare_geo = document.getElementById("compare_geoms").options[document.getElementById("compare_geoms").value].text
            // for (i=0; i < Object.keys(compares[compare_geo]).length; i++){
            //   console.log(compares[compare_geo][Object.keys(compares[compare_geo])[i]])
            //   $("#additional_filter").append($('<option></option>').attr("value", Object.keys(compares[compare_geo])[i]).text(Object.keys(compares[compare_geo])[i]))
            // };
            // var additional_filter_val = document.getElementById("additional_filter").value
            //   // $("#additional_filter").append($('<option></option>').attr("value", f.attributes["subject_area"].trim()).text(f.attributes["subject_area"]))
            

            // geoCompare = [compares, compare_geo, additional_filter_val]
            // var add_to_chart = document.getElementById("add_to_chart").checked
            // updateChart(compares[compare_geo][additional_filter_val], chart, false, add_to_chart, false)

        },

        async renderLayer(){
            var census_data_layer = await this.geometry.sublayers.find(function(sublayer) {
              return sublayer.title === "Census Data";
            });
            // var year_field = `NCDOT_Demographics.DBO.${this.selectedTable.name}.year`
            // census_data_layer.definitionExpression = `year <= date'1/1/2018' or year >= date'1/1/2011'`
            // var statsField = `NCDOT_Demographics.DBO.${this.selectedTable.name}.${this.selectedField.id}`
            var features_data = {}
            var oid_field = `a_${this.selectedGeoUnit.alias}.OBJECTID`
            this.oid_field = oid_field
            var fields = await census_data_layer.queryFeatures({where:`${oid_field} = 1`, outFields: "*", returnGeometry:false})
            fields = fields.fields;
            var selected_field = this.selectedField.id
            var statsField = fields.find(function(field){
              let this_field = field.name.split(".").at(-1)

              return this_field === selected_field
            })
            
            this.statsField = statsField.name
            var yearField = fields.find(function(field){
              let this_field = field.name.split(".").at(-1)

              return this_field === "year"
            })
            this.yearField = yearField.name;
            var geo_id_field = fields.find(function(field){
              let this_field = field.name.split(".").at(-1)

              return this_field === "geo_id"
            })
            this.geo_id_field = geo_id_field.name;
            // var res = await census_data_layer.queryFeatures({where:'1=1', outFields: [this.statsField, this.yearField, oid_field], returnGeometry: false});
            var res = await census_data_layer.queryFeatures({where:'1=1', outFields: ["*"], returnGeometry: false});

            var resultsArray = [];
            res.features.forEach(f => {
              features_data[f.attributes[oid_field]] = f.attributes
                resultsArray.push(f.attributes[this.statsField])
            })
            this.selectedFeaturesData = features_data;
            console.log(resultsArray)
            var max = Math.max(...resultsArray);
            var min = Math.min(...resultsArray);
            console.log(resultsArray);
            
 
               
            const layerColors = ["#910000", "#c33910", "#f6711f", "#fbaf52", "#ffed85"];
            // var query = census_data_layer.createQuery();
            // query.outStatistics = [fieldMax, fieldMin]
            // var response = await census_data_layer.queryFeatures(query)

           
            var renderer;
            if (this.selectedNormField){
              var selectedNormField = this.selectedNormField.id;
                var normField = res.fields.find(function(field){
                  let this_field = field.name.split(".").at(-1)

                  return this_field === selectedNormField
                })
                normField= normField.name
                this.normField = normField
                // var normField = `NCDOT_Demographics.DBO.${this.selectedTable.name}.${this.selectedNormField.id}`
                renderer = new ClassBreaksRenderer({
                type: "class-breaks",
                // attribute of interest - Earthquake magnitude
                field: this.statsField,
                normalizationField: this.normField,
                classBreakInfos: [
                  {
                    minValue: 0,  // 0 acres
                    maxValue:0,  // 200,000 acres
                    symbol: { type: "simple-fill", color: "#a2a4a6"},
                    label: "0"  
                  },
                  {
                    minValue: .01,  // 0 acres
                    maxValue: .25,  // 200,000 acres
                    symbol: { type: "simple-fill", color: layerColors[3]},  // will be assigned sym1
                    label: `1 - 25 %`
                  },
                  {
                    minValue: .26,  // 0 acres
                    maxValue: .50,  // 200,000 acres
                    symbol: { type: "simple-fill", color: layerColors[2]},  // will be assigned sym1
                    label: `26 - 50%`
                  },
                  {
                    minValue: .51,  // 0 acres
                    maxValue: .75,  // 200,000 acres
                    symbol: { type: "simple-fill", color: layerColors[1]},  // will be assigned sym1
                    label: `51 - 75%`
                  },
                  {
                    minValue: .76,  // 0 acres
                    maxValue: 1,  // 200,000 acres
                    symbol: { type: "simple-fill", color: layerColors[0]},  // will be assigned sym1
                    label: `76 - 100%`
                  },
                  
                ],

              });
  
                }else{
                renderer = new ClassBreaksRenderer({
                  type: "class-breaks",
                  // attribute of interest - Earthquake magnitude
                  field: this.statsField,
                  classBreakInfos: [
                    {
                      minValue: 0,  // 0 acres
                      maxValue:0,  // 200,000 acres
                      symbol: { type: "simple-fill", color: "#a2a4a6"},
                      label: "0"  
                    },
                    {
                      minValue: min + 1,  // 0 acres
                      maxValue: max/4,  // 200,000 acres
                      symbol: { type: "simple-fill", color: layerColors[3]},  // will be assigned sym1
                      label: `${min + 1} - ${max/4}`
                    },
                    {
                      minValue: max/4 + 1,  // 0 acres
                      maxValue: max/4*2,  // 200,000 acres
                      symbol: { type: "simple-fill", color: layerColors[2]},  // will be assigned sym1
                      label: `${max/4 + 1} - ${max/4*2}`
                    },
                    {
                      minValue: max/4 *2+ 1,  // 0 acres
                      maxValue: max/4*3,  // 200,000 acres
                      symbol: { type: "simple-fill", color: layerColors[1]},  // will be assigned sym1
                      label: `${max/4*2 + 1} - ${max/4*3}`
                    },
                    {
                      minValue: max/4 *3+ 1,  // 0 acres
                      maxValue: max,  // 200,000 acres
                      symbol: { type: "simple-fill", color: layerColors[0]},  // will be assigned sym1
                      label: `${max/4*3 + 1} - ${max}`
                    },
                    
                  ],
  
                });
              }
            

            console.log(renderer)
              
            census_data_layer.renderer = renderer;
            var popupTemplate = {
                // autocasts as new PopupTemplate()
                title: `{a_${this.selectedGeoUnit.alias}.NAME}`,
                content: this.populationChange
              }
            census_data_layer.popupTemplate = popupTemplate
            // this.geometry.popupTemplate = popupTemplate
            // this.map.layers = [this.geometry]
            // var popupTemplate = {
            //     // autocasts as new PopupTemplate()
            //     title: `{NCDOT_Demographics.DBO.${this.selectedTable.name}.geo_name}`,
            //     content: this.populationChange,
            //     outFields: ["*"],
                
            //   }
            // census_data_layer.popupTemplate = popupTemplate;
          
        },


        async makeGeometry(){
          var geometry = new MapImageLayer({
                  url:baseurl,
                  title: "Census Geometry",
                  sublayers:[
                    {
                      id:0,
                      visible:false,
                      title: "BlockGroups"
                    },
                    {
                      id:1,
                      visible:false,
                      title: "Counties"
                    },
                    {
                      id:2,
                      visible:false,
                      title: "State"
                    },
                    {
                      id: 3,
                      visible:false,
                      title:"Tracts"
                    },
                    {
                      id: 4,
                      visible:false,
                      title:"ZipCodes"
                    }
                  ]
                })
                return geometry

        },
        async getAttributes(){


          

                this.table = new FeatureLayer({
                  url:baseurl+this.selectedTable.id,
                  
                })
                console.log(baseurl+this.selectedTable.id)
                var queryGeoName = []

                for (let i = 0; i < this.selectedGeoUnit.alias.length; i++) {
                  if (i===0){
                    queryGeoName.push(this.selectedGeoUnit.alias[i].toUpperCase())
                  }else{
                    queryGeoName.push(this.selectedGeoUnit.alias[i].toLowerCase())
                  }
                  
                }
                let geo_name = queryGeoName.join("")
                let res;
                let features=[];
                res = await this.table.queryFeatures({where: `year = DATE '${this.selectedYear.alias}-1-1' AND geo_unit = '${geo_name}'`, outFields:["geo_id", this.selectedField.id]})
                console.log(res)
                if (res.features.length === 0){
                  console.log("here")
                  res = await this.table.queryFeatures({where: `year = DATE '${this.selectedYear.alias}-1-1'`, outFields:["geo_id", this.selectedField.id]})
                  if (geo_name.includes("Counties")){
                    res.features.forEach(feature =>{
                      if (feature.attributes.geo_id.length ===5){
                        features.push(feature)
                      }
                    })
                  }else if(geo_name.includes("Tracts")){
                    res.features.forEach(feature =>{
                      if (feature.attributes.geo_id.length ===11){
                        features.push(feature)
                      }
                    })
                  }
                }else{
                  features = res.features
                }
                // var res = await this.table.queryFeatures({where: `year = DATE '${this.selectedYear}-1-1' AND geo_unit = '${queryGeoName.join("")}'`, outFields:["geo_id", this.selectedField.id]})
                if (features.length == 0){
                  return
                }
                console.log(features)

                var attributes = []
                var attributes_array = []
                this.attributes_object = {}
                this.uniqueValueInfos = []
                features.forEach(element => {
                  attributes.push(element.attributes);
                  attributes_array.push(element.attributes[this.selectedField.id])
                  this.attributes_object[element.attributes.geo_id] = element.attributes[this.selectedField.id]
                 
                });
                this.max = Math.max(...attributes_array)
                this.min = Math.min(...attributes_array)
                
                for (const property in this.attributes_object){
                  if(this.attributes_object[property] === 0){
                    this.uniqueValueInfos.push({value:property, symbol: { type: "simple-fill", color: "#a2a4a6"}})
                  }else if((this.attributes_object[property] > this.min + 1) & ( this.attributes_object[property] < this.max/4)){
                    this.uniqueValueInfos.push({value:property, symbol: { type: "simple-fill", color: this.layerColors[3]}})
                  }else if((this.attributes_object[property] > this.max/4 + 1) & ( this.attributes_object[property] < this.max/4*2)){
                    this.uniqueValueInfos.push({value:property, symbol: { type: "simple-fill", color: this.layerColors[2]}})
                  }else{
                    this.uniqueValueInfos.push({value:property, symbol: { type: "simple-fill", color: this.layerColors[1]}})
                  }
                }

                return attributes
        },

        joinLayer(){
          var parent = `NCDOT_Demographics.DBO.${this.selectedGeoUnit.alias}`
          var child = `NCDOT_Demographics.DBO.${this.selectedTable.alias}`

          var lyr = new MapImageLayer({
            url: baseurl,
            title: this.selectedField.aliasLong,
            
            sublayers:[{
              title: "Census Data",
              id: 0,
              opacity: 0.75,
              popupEnabled:true,
              popupTemplate: {
                  title: "{NAME}",
                  content: "{NAME}-{GEOID}--{year}"
                },
              
              source:{
                type: "data-layer",
                dataSource:{
                  type:"query-table",
                  workspaceId:"5332",
                  query: `SELECT ${parent}.NAME, ${parent}.OBJECTID, ${parent}.GEOID, ${child}.year  FROM ${parent} JOIN ${child} ON ${parent}.GEOID = ${child}.geo_id where ${child}.year > '2017-1-1'`,
                  spatialReference: { wkid:4326},
                  geometryType: "polygon",
                  oidFields: "OBJECTID"
                }
              }
            }
            ]
          });

          return lyr

        },

        makeLayer(){
          // going to have to dump the table into memory, filtering by year, then do the dynamic join
          // if (geo_name.includes("COUNTIES")){
          //   var plus_def = `AND geo_name LIKE '%County%'`
          // }else{
          //   var plus_def = ''
          // }
          console.log(this.selectedYear)
          console.log(this.selectedField)
          console.log(this.selectedGeoUnit)
          console.log(this.selectedTable)
          console.log(`dbo.${this.selectedTable.name}.year = date'1/1/${this.selectedYear}' `)
          var child = `NCDOT_Demographics.DBO.${this.selectedTable.alias}`
          let statsField = `${child}.${this.selectedField.id}`
          let oid_field = `${child}.OBJECTID`
          var normField
          if (this.selectedNormField){
            normField = `, ${child}.${this.selectedNormField.id}`
          }
          let geo_id_field = `${child}.geo_id`
          let year_field = `${child}.year`


          // var statsField = `census.census.${this.selectedTable.name}.${this.selectedField.id.toLowerCase()}`
          var lyr = new MapImageLayer({
            url: baseurl,
            title: this.selectedField.aliasLong,
            sublayers: [
              {
                title: "Census Data",
                id: 0,
                opacity: 0.75,
                // definitionExpression : `NCDOT_Demographics.DBO.${this.selectedTable.name}.year = date'1/1/${this.selectedYear.alias}' `,
                // definitionExpression : `NCDOT_Demographics.DBO.${this.selectedTable.name}.OBJECTID > 1' `,
                source: {
                  // indicates the source of the sublayer is a dynamic data layer
                  type: "data-layer",
                  // this object defines the data source of the layer
                  // in this case it's a joined table
                  dataSource: {
                    type: "join-table",
                    leftTableSource: {
                      type: "map-layer",
                      mapLayerId: this.selectedGeoUnit.id
                    },
                    rightTableSource: {
                      type: "data-layer",
                      dataSource:{
                        type:"query-table",
                        workspaceId:"5332",
                        query: `SELECT ${statsField}, ${oid_field}, ${geo_id_field}, ${year_field} ${this.selectedNormField ? normField:""}  FROM ${child} where year >= '${this.selectedYear.alias -1}-12-31' and year <= '${this.selectedYear.alias}-01-01'`,
                        oidFields: "OBJECTID"
                      }
                      // dataSource: {
                      //   type: "table",
                      //   workspaceId: "5332",
                      //   dataSourceName: `${this.selectedTable.name}`
                      // }
                    },
                    leftTableKey: "GEOID",
                    rightTableKey: "geo_id",
                    joinType: "left-inner-join"
                  }
                },
              }
            ]
            });
          console.log(lyr)
          
          return lyr



        },

       async renderAttributes(){


        // var renderer = new ClassBreaksRenderer({
        //           type: "class-breaks",
        //           // attribute of interest - Earthquake magnitude
        //           field: `${this.selectedField.id}`,
        //           classBreakInfos: [
        //             {
        //               minValue: 0,  // 0 acres
        //               maxValue:0,  // 200,000 acres
        //               symbol: { type: "simple-fill", color: "#a2a4a6"},
        //               label: "0"  r
        //             },
        //             {
        //               minValue: this.min + 1,  // 0 acres
        //               maxValue: this.max/4,  // 200,000 acres
        //               symbol: { type: "simple-fill", color: this.layerColors[3]},  // will be assigned sym1
        //               label: `${this.min + 1} - ${this.max/4}`
        //             },
        //             {
        //               minValue: this.max/4 + 1,  // 0 acres
        //               maxValue: this.max/4*2,  // 200,000 acres
        //               symbol: { type: "simple-fill", color: this.layerColors[2]},  // will be assigned sym1
        //               label: `${this.max/4 + 1} - ${this.max/4*2}`
        //             },
        //             {
        //               minValue: this.max/4 *2+ 1,  // 0 acres
        //               maxValue: this.max/4*3,  // 200,000 acres
        //               symbol: { type: "simple-fill", color: this.layerColors[1]},  // will be assigned sym1
        //               label: `${this.max/4*2 + 1} - ${this.max/4*3}`
        //             },
        //             {
        //               minValue: this.max/4 *3+ 1,  // 0 acres
        //               maxValue: this.max,  // 200,000 acres
        //               symbol: { type: "simple-fill", color: this.layerColors[0]},  // will be assigned sym1
        //               label: `${this.max/4*3 + 1} - ${this.max}`
        //             },
                    
        //           ],

        //         });
        var renderer = new UniqueValueRenderer({
          field: "GEOID",
          uniqueValueInfos: this.uniqueValueInfos
        })
        var this_sublayer = null
        console.log(this.geometry.sublayers)
        this.geometry.sublayers.items.forEach((sublayer)=>{
          console.log(this.selectedGeoUnit.id)
          if (sublayer.id == this.selectedGeoUnit.id){
            this_sublayer = sublayer
          }else{
            sublayer.visible=false;
          }
        })
        this_sublayer.visible=true;

        this_sublayer.renderer = renderer
        console.log(this_sublayer)


        // this_sublayer.definitionExpression = `GEOID in ("${Object.keys(this.attributes_object).join('", "')}")`

        return

        
        },
        async loadGeometryValues(){
          // let geomValues = await esriRequest(baseurl)
          
        },
        updateChart(newData){
          var dataset_names = [...new Set(newData.map((item)=> item.geo_name))]
          var datasets = []
          var labels = [...new Set(newData.map((item)=> item.year))] 
          labels.sort()
          dataset_names.forEach(d =>{
            var this_dataset = newData.filter(newD => {
              return newD.geo_name === d
            })
            var this_dataset = this_dataset.map(thisD =>{
              return {x: thisD.year, y:thisD.value}
            })
            datasets.push({data: this_dataset, label: d, backgroundColor:  'rgba(255, 99, 132, 0.2)'})
          })
          this.basicData.datasets = datasets;
          this.basicData.labels = labels;
          return {labels: labels, data: datasets}
        },

      
    },
  
    data(){
        return{
            map:null,
            view: null,
            geometry: null,
            table: null,
            attributes: null,
            attributes_object: null,
            max: null,
            min: null,
            layerColors: ["#910000", "#c33910", "#f6711f", "#fbaf52", "#ffed85"],
            selectedTableIndex: 9,
            selectedGeometryIndex: 1,
            Counties: null,
            tableOptions: {},
            layerOptions: {},
            uniqueValueInfos: [],
            normalizationField: null,
            sketchViewModel: null,
            polygonGraphicsLayer: null,
            selectedFeaturesData: null,
            displayChart: false,
            basicData: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                    {
                        label: 'My First dataset',
                        backgroundColor: '#42A5F5',
                        data: [65, 59, 80, 81, 56, 55, 40]
                    },
                    {
                        label: 'My Second dataset',
                        backgroundColor: '#FFA726',
                        data: [28, 48, 40, 19, 86, 27, 90]
                    }
                ]
            },
            basicOptions: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#495057'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#495057'
                        },
                        grid: {
                            color: '#ebedef'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#495057'
                        },
                        grid: {
                            color: '#ebedef'
                        }
                    }
                }
            },
        }
    }
}
</script>

<style scoped>

    h3 {
      margin: 40px 0 0;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      display: inline-block;
      margin: 0 10px;
    }
    a {
      color: #42b983;
    }
    .box{
      position: absolute;
      top: 10vh;
      right: 10px;
      z-index: 9999;
      text-align: center;
      width: 500px;
      margin-left: -75px; /* half of the width */
      background-color:rgb(255, 255, 255);
      height: 400px;
  }
    </style>