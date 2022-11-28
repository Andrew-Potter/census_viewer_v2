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
import Legend from "@arcgis/core/widgets/Legend"
import LayerList from "@arcgis/core/widgets/LayerList"

var baseurl = "https://ncdotsandbox.cnr.ncsu.edu/arcgis/rest/services/DemographicApp/DemographicWebMap/MapServer/"


export default {
    name: "Map",
    props:{

    },
    watch:{

    },
    async mounted(){
        await this.loadMap()
    },
    methods:{
        async loadMap(){
            console.log("build???")
            // var layer = await this.makeLayer(1, "Counties", "NCDOT_Demographics.dbo.B02001", "B02001_002", "Race|Total Population|White Alone", "2018", true, "B02001_001")
            this.geometry = await this.makeGeometry();
            this.attributes = await this.getAttributes(1, "Race|Total Population|White Alone", null)
            
            // await this.renderLayer(layer, "NCDOT_Demographics.dbo.B02001", "B02001_002", false, "B02001_002", "NCDOT_Demographics.dbo.Counties", "Race|Total Population|White Alone",'2018' )
            this.map = new Map({
                basemap: "gray",
                layers:[this.geometry]
            })

            this.renderAttributes()

            // this.map.add(layer)
            // this.map.add(new_layer)
            // console.log(layer)
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
        async getAttributes(geo_index, field_alias, normalizationField){

          

                this.table = new FeatureLayer({
                  url:baseurl+this.selectedTableIndex,
                  
                })
                // console.log(table)

                var res = await this.table.queryFeatures({where: `year = DATE '${this.selectedYear}-1-1' AND geo_unit = '${this.selectedGeoUnit}'`, outFields:["geo_id", this.selectedField]})
                console.log(res.features)
                var attributes = []
                var attributes_array = []
                this.attributes_object = {}
                res.features.forEach(element => {
                  attributes.push(element.attributes);
                  attributes_array.push(element.attributes[this.selectedField])
                  this.attributes_object[element.attributes.geo_id] = element.attributes[this.selectedField]
                });
                this.max = Math.max(...attributes_array)
                this.min = Math.min(...attributes_array)
                return attributes
       },

       async renderAttributes(){

        var renderer = new ClassBreaksRenderer({
                  type: "class-breaks",
                  // attribute of interest - Earthquake magnitude
                  field: `${this.selectedField}`,
                  classBreakInfos: [
                    {
                      minValue: 0,  // 0 acres
                      maxValue:0,  // 200,000 acres
                      symbol: { type: "simple-fill", color: "#a2a4a6"},
                      label: "0"  
                    },
                    {
                      minValue: this.min + 1,  // 0 acres
                      maxValue: this.max/4,  // 200,000 acres
                      symbol: { type: "simple-fill", color: this.layerColors[3]},  // will be assigned sym1
                      label: `${this.min + 1} - ${this.max/4}`
                    },
                    {
                      minValue: this.max/4 + 1,  // 0 acres
                      maxValue: this.max/4*2,  // 200,000 acres
                      symbol: { type: "simple-fill", color: this.layerColors[2]},  // will be assigned sym1
                      label: `${this.max/4 + 1} - ${this.max/4*2}`
                    },
                    {
                      minValue: this.max/4 *2+ 1,  // 0 acres
                      maxValue: this.max/4*3,  // 200,000 acres
                      symbol: { type: "simple-fill", color: this.layerColors[1]},  // will be assigned sym1
                      label: `${this.max/4*2 + 1} - ${this.max/4*3}`
                    },
                    {
                      minValue: this.max/4 *3+ 1,  // 0 acres
                      maxValue: this.max,  // 200,000 acres
                      symbol: { type: "simple-fill", color: this.layerColors[0]},  // will be assigned sym1
                      label: `${this.max/4*3 + 1} - ${this.max}`
                    },
                    
                  ],

                });
        var this_sublayer = null
        this.geometry.sublayers.items.forEach((sublayer)=>{
          
          if (sublayer.id == this.selectedGeometryIndex){
            this_sublayer = sublayer
          }
        })
        
        console.log(this.$data[this_sublayer.title])
        if(this.$data[this_sublayer.title] ===null){
          console.log("here")
          let geom = await this_sublayer.queryFeatures({where:"1=1", returnGeometry: true, outFields:"*"})
          this.$data[this_sublayer.title] = geom.features
        }
        var fields = this_sublayer.fields
        fields.push({"name":this.selectedField, type:"double"})
        console.log(this_sublayer)
        
        this.$data[this_sublayer.title].forEach(feature=>{

          feature.attributes[this.selectedField] = this.attributes_object[feature.attributes.GEOID]
        })
        this.activeGeometry = new FeatureLayer({
          source:this.$data[this_sublayer.title],
          objectIdField: "OBJECTID",
          fields:fields
        })
        this.activeGeometry.renderer=renderer
        // console.log(await this.activeGeometry.queryFeatures())
        this.map.add(this.activeGeometry)
       },

       async renderLayer(layer, table_name, field_name, normalize, normalize_field, geo_name, fieldAlias, year){
           console.log("render ")
            console.log(layer)
            console.log(table_name)
            console.log(field_name)
            console.log(normalize)
            console.log(normalize_field),
            console.log(geo_name)
            console.log(fieldAlias)
            // var new_field_name = `NCDOT_Demographics.DEMOGRAPHICAPP.%${geo_name}.${field_name}`
            var new_field_name = `${table_name}.${field_name}`
            console.log(new_field_name)
          var census_data_layer = layer.sublayers.find(function(sublayer) {
            return sublayer.title === "Census Data";
          });
          console.log(census_data_layer)


          var fieldMax = {
            onStatisticField: new_field_name, 
            outStatisticFieldName: "fieldmax",
            statisticType: "max"
          };

          var fieldMin = {
            onStatisticField: new_field_name,  
            outStatisticFieldName: "fieldmin",
            statisticType: "min"
          };
          

          var max
          var min

          // var query = census_data_layer.createQuery();
          // query.outStatistics = [fieldMax, fieldMin]
          // var resp =  await census_data_layer.queryFeatures(query)

          // console.log(resp)

             
          const layerColors = ["#910000", "#c33910", "#f6711f", "#fbaf52", "#ffed85"];
          console.log(year)
          // var res = await census_data_layer.queryFeatures({where:`${table_name}.year = DATE'${year}-1-1' `,outFields:[new_field_name]})
          var res = await census_data_layer.queryFeatures({where:"1=1",outFields:[new_field_name]})

          console.log(res)
          var field_array = res.features.map(x=>x.attributes[new_field_name])

          max = Math.max(...field_array)
          min = Math.min(...field_array)
          console.log(max)
          console.log(min)
          
          console.log(field_array)

          if (normalize === true){
                var renderer = new ClassBreaksRenderer({
                type: "class-breaks",
                // attribute of interest - Earthquake magnitude
                field: `${table_name}.${field_name}`,
                normalizationField: `${table_name}.${normalize_field}`,
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
                var renderer = new ClassBreaksRenderer({
                  type: "class-breaks",
                  // attribute of interest - Earthquake magnitude
                  field: `${table_name}.${field_name}`,
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
                title: `{${table_name}.geo_name}`,
                content: populationChange,
                outFields: ["*"],
                  
                fieldInfos: [
                  {
                    fieldName: `${table_name}.${field_name}`,
                    label: fieldAlias,
                    visible: true,
                    format: {
                      digitSeparator: true,
                      places: 0
                    }
                  },
                  {
                    fieldName: `${table_name}.${normalize_field}`,
                    label: "Total Population",
                    visible: true,
                    format: {
                      digitSeparator: true,
                      places: 0
                    }
                  },
                  {
                    fieldName: `total_population`,
                    label: "Total Population",
                    visible: true,
                    format: {
                      digitSeparator: true,
                      places: 0
                    }
                  },
                ]
              
                
              }
            census_data_layer.popupTemplate = popupTemplate

            function populationChange (feature) {
              var div = document.createElement("div");
              // calculate the population percent change from 2010 to 2013.
              selectedGeoId = feature.graphic.attributes[`${table_name}.geo_id`]
              queryGeoLayers(selectedGeoId);
              selectFeatures(feature.graphic.geometry.centroid, chart, false)
              let proportion = feature.graphic.attributes[`${table_name}.${field_name}`] / feature.graphic.attributes[`${table_name}.${normalize_field}`] 
              let percent = proportion * 100
              console.log(percent)
              div.innerHTML =
                `${fieldAlias}: ${feature.graphic.attributes[`${table_name}.${field_name}`]} <br>
                Total Population: ${feature.graphic.attributes[`${table_name}.${normalize_field}`]} <br>
                Percent: ${percent.toFixed(2)}<br>
                Year: ${new Date(feature.graphic.attributes[`${table_name}.year`]).getFullYear() + 1}
                `
              console.log(div.innerHTML);
              view.popup.highlightEnabled = true
              return div;
              
            };

            return layer


                    
          // })


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
            selectedField: "B02001_002",
            selectedTable: "B02001",
            selectedTableIndex: 9,
            selectedGeometryIndex: 1,
            Counties: null,
            selectedYear: "2019",
            selectedGeoUnit: "Counties"
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