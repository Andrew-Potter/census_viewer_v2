<template>
    

    <div class="mapview" style="height: 100%; width:100%;">

    </div>


</template>


<script>

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer"
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer"
import Legend from "@arcgis/core/widgets/Legend"
import esriRequest from "@arcgis/core/request"
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
        async executeQuery(){
          this.geometry = this.makeLayer()
          this.map.layers = [this.geometry]
          this.renderLayer()
          // this.geometry = await this.makeGeometry();
          // this.attributes = await this.getAttributes()
          // this.map.layers = [this.geometry]
          // this.renderAttributes()

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
          // let layerlist = new LayerList({
          //   view: this.view
          // });
          // this.view.ui.add(layerlist, "top-right");
       
        },
        async populationChange (feature) {
              var div = document.createElement("div");
              console.log(feature)
              // calculate the population percent change from 2010 to 2013.
              var selectedGeoId = feature.graphic.attributes[`${this.selectedTable.name}.geo_id`]
              this.queryGeoLayers(selectedGeoId);
              // queryGeoLayers(selectedGeoId);
              // selectFeatures(feature.graphic.geometry.centroid, chart, false)
              var fieldName = `dbo.${this.selectedTable.name}.${this.selectedField.id.toLowerCase()}`
              var normFieldName = `dbo.${this.selectedTable.name}.${this.selectedNormField.id.toLowerCase()}`
              let proportion = feature.graphic.attributes[fieldName] / feature.graphic.attributes[normFieldName] 
              let percent = proportion * 100

              div.innerHTML =
                `${this.selectedField.alias}: ${feature.graphic.attributes[fieldName]} <br>
                Total Population: ${feature.graphic.attributes[normFieldName]} <br>
                Percent: ${percent.toFixed(2)}<br>
                Year: ${new Date(feature.graphic.attributes[`dbo.${this.selectedTable.name}.year`]).getFullYear() + 1}
                `
              console.log(div.innerHTML);
              this.view.popup.highlightEnabled = true
              return div;
              
            },
        
        async queryGeoLayers(geoid){

          // var tableAlias = this.selectedTable.alias 
          var geomValue = this.selectedGeoUnit.id
          console.log(geomValue)
          var searchGeoms = ["37"]
          var countyId;
          if (geomValue === 0){
            var tractId = geoid.slice(0, -1)
            countyId = geoid.slice(0, -7)
            searchGeoms.push(tractId)
            searchGeoms.push(countyId)
          } else if (geomValue === 1){
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
                if (f.attributes.geo_name in compares[f.attributes.geo_unit] === false){
                  compares[f.attributes["geo_unit"]][f.attributes.geo_name] = [f]
                }else{
                  compares[f.attributes["geo_unit"]][f.attributes.geo_name].push(f)
                }
                
              } catch{
                console.log("fail")
              }
              });

          

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
            
            var census_data_layer = this.geometry.sublayers.find(function(sublayer) {
              return sublayer.title === "Census Data";
            });
            console.log(census_data_layer)
            // census_data_layer.definitionExpression =  `NCDOT_Demographics.DBO.${this.selectedTable.name}.year = date'1/1/${this.selectedYear}' `
            var statsField = `NCDOT_Demographics.DBO.${this.selectedTable.name}.${this.selectedField.id}`
            var res = await census_data_layer.queryFeatures({where:'1=1', outFields:[statsField]});
            console.log(res);
            var resultsArray = [];
            res.features.forEach(f => {
              resultsArray.push(f.attributes[statsField])
            })

            var max = Math.max(...resultsArray);
            var min = Math.min(...resultsArray);
            console.log(resultsArray);
            
 
               
            const layerColors = ["#910000", "#c33910", "#f6711f", "#fbaf52", "#ffed85"];
            // var query = census_data_layer.createQuery();
            // query.outStatistics = [fieldMax, fieldMin]
            // var response = await census_data_layer.queryFeatures(query)

           
            var renderer;
            if (this.selectedNormField){
                var normField = `NCDOT_Demographics.DBO.${this.selectedTable.name}.${this.selectedNormField.id}`
                renderer = new ClassBreaksRenderer({
                type: "class-breaks",
                // attribute of interest - Earthquake magnitude
                field: statsField,
                normalizationField: normField,
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
                  field: statsField,
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
                title: `{NCDOT_Demographics.DBO.${this.selectedTable.name}.geo_name}`,
                content: this.populationChange,
                outFields: ["*"],
                
              }
            census_data_layer.popupTemplate = popupTemplate;
          
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

        makeLayer(){
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
          // var statsField = `census.census.${this.selectedTable.name}.${this.selectedField.id.toLowerCase()}`
          return new MapImageLayer({
            url: baseurl,
            title: this.selectedField.aliasLong,
            definitionExpression : `NCDOT_Demographics.DBO.${this.selectedTable.name}.year = date'1/1/${this.selectedYear.alias}' `,
            sublayers: [
              {
                title: "Census Data",
                id: 0,
                opacity: 0.75,
                            
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
                      dataSource: {
                        type: "table",
                        workspaceId: "5332",
                        dataSourceName: `NCDOT_Demographics.DBO.${this.selectedTable.name}`
                      }
                    },
                    leftTableKey: "GEOID",
                    rightTableKey: "geo_id",
                    joinType: "left-inner-join"
                  }
                },
              }
            ]
            });



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
        //               label: "0"  
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
          
        }

      
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
            normalizationField: null
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
    </style>