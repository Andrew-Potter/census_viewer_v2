<template>
    

    <div class="mapview" style="height: 100%; width:100%;">

    </div>


</template>


<script>

import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer"
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer"

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
            console.log("here")
            var layer = await this.makeLayer(1, "COUNTIES", "NCDOT_Demographics.dbo.B02001", "B02001_002", "Race|Total Population|White Alone", "2019", true, "B02001_001")
            this.renderLayer(layer, "NCDOT_Demographics.dbo.B02001", "B02001_002", true, "B02001_002", "NCDOT_Demographics.dbo.Counties", "Race|Total Population|White Alone", )

            this.map = new Map({
                basemap: "gray",
                layers:layer
            })

            console.log(layer)
            this.view =  new MapView({
                container: this.$el,
                map: this.map,
                center: [-79.59999218313682, 35.86808963573905],
                zoom: 8,            
            });
        },
        async makeLayer(geo_index, geo_name, table_name, field_name, field_alias, year, normalize, normalizationField){

            if (geo_name.includes("Counties")){
                var plus_def = `AND ${table_name}.geo_name LIKE '%County%'`
            }else{
                var plus_def = ''
                }
            
                console.log(`${table_name}.year = date'1/1/${year}'${plus_def} `)

            return new MapImageLayer({
                url: baseurl,
                title: field_alias,
                sublayers: [
                    {
                        title: "Census Data",
                        id: 0,
                        opacity: 0.75,
                        definitionExpression: `${table_name}.year = date'1/1/${year}'${plus_def} `,              
                        source: {
                            // indicates the source of the sublayer is a dynamic data layer
                            type: "data-layer",
                            // this object defines the data source of the layer
                            // in this case it's a joined table
                            dataSource: {
                            type: "join-table",
                            leftTableSource: {
                                type: "map-layer",
                                mapLayerId: geo_index
                            },
                                rightTableSource: {
                                    type: "data-layer",
                                    dataSource: {
                                        type: "table",
                                        workspaceId: "5332",
                                        dataSourceName: table_name
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
       async renderLayer(layer, table_name, field_name, normalize, normalize_field, geo_name, fieldAlias){
           console.log("render ")
            console.log(layer)
            console.log(table_name)
            console.log(field_name)
            console.log(normalize)
            console.log(normalize_field),
            console.log(geo_name)
            console.log(fieldAlias)
            // var new_field_name = `NCDOT_Demographics.DEMOGRAPHICAPP.%${geo_name}.${field_name}`
            var new_field_name = `NCDOT_Demographics.dbo.B02001.${field_name}`
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

             
          const layerColors = ["#910000", "#c33910", "#f6711f", "#fbaf52", "#ffed85"];
          var res = await census_data_layer.queryFeatures({where:"1=1",outFields:[new_field_name]})
          console.log(res)
          var field_array = res.features.map(x=>x.attributes[new_field_name])

          max = Math.max(...field_array)
          min = Math.min(...field_array)
          console.log(max)
          console.log(min)
          
          console.log(field_array)
          var query = census_data_layer.createQuery();
          query.outStatistics = [fieldMax, fieldMin]
          query.where="1=1"
          console.log(query)
          census_data_layer.queryFeatures(query)
            .then(function(response){
              console.log(response)
              var stats = response.features[0].attributes;
              max = stats.fieldmax
              min = stats.fieldmin
              console.log(`${table_name}.${field_name}`)
              if (normalize){
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
            };


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
              // return renderer


                    
          // })


        })}
    },
    data(){
        return{
            map:null,
            view: null

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