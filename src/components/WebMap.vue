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

// import esriRequest from "@arcgis/core/request"

var baseurl = "https://ncdotsandbox.cnr.ncsu.edu/arcgis/rest/services/DemographicApp/DemographicWebMap/MapServer/"


export default {
    name: "Map",
    props:{
      selectedGeoUnit:Object, 
      selectedSubjectArea: Object, 
      selectedTable: Object,
      selectedField: Object,
      selectedYear: String, 
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
          this.geometry = await this.makeGeometry();
          this.attributes = await this.getAttributes()
          this.map.layers = [this.geometry]
          this.renderAttributes()

        },
        async loadMap(){
            // var layer = await this.makeLayer(1, "Counties", "NCDOT_Demographics.dbo.B02001", "B02001_002", "Race|Total Population|White Alone", "2018", true, "B02001_001")

            
            // await this.renderLayer(layer, "NCDOT_Demographics.dbo.B02001", "B02001_002", false, "B02001_002", "NCDOT_Demographics.dbo.Counties", "Race|Total Population|White Alone",'2018' )
            this.map = new Map({
                basemap: "gray",
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
                // console.log(table)
                console.log(`year = DATE '${this.selectedYear}-1-1' AND geo_unit = '${this.selectedGeoUnit.alias}'`)
                console.log(this.selectedField.id)
                var queryGeoName = []

                for (let i = 0; i < this.selectedGeoUnit.alias.length; i++) {
                  if (i===0){
                    queryGeoName.push(this.selectedGeoUnit.alias[i].toUpperCase())
                  }else{
                    queryGeoName.push(this.selectedGeoUnit.alias[i].toLowerCase())
                  }
                  
                }

                var res = await this.table.queryFeatures({where: `year = DATE '${this.selectedYear}-1-1' AND geo_unit = '${queryGeoName.join("")}'`, outFields:["geo_id", this.selectedField.id]})
                if (res.features == null){
                  return
                }
                console.log(res.features)
                var attributes = []
                var attributes_array = []
                this.attributes_object = {}
                res.features.forEach(element => {
                  attributes.push(element.attributes);
                  attributes_array.push(element.attributes[this.selectedField.id])
                  this.attributes_object[element.attributes.geo_id] = element.attributes[this.selectedField.id]
                  console.log(this.attributes_object)
                });
                this.max = Math.max(...attributes_array)
                this.min = Math.min(...attributes_array)
                return attributes
        },
       async renderAttributes(){

        var renderer = new ClassBreaksRenderer({
                  type: "class-breaks",
                  // attribute of interest - Earthquake magnitude
                  field: `${this.selectedField.id}`,
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
          console.log(this.selectedGeoUnit.id)
          if (sublayer.id == this.selectedGeoUnit.id){
            this_sublayer = sublayer
          }
        })
        console.log(this_sublayer)
        
        console.log(this.$data[this_sublayer.title])
        // if(this.$data[this_sublayer.title] ===null){
        //   console.log("here")
        //   let geom = await this_sublayer.queryFeatures({where:"1=1", returnGeometry: true, outFields:"*"})
        //   console.log(geom)
        //   this.$data[this_sublayer.title] = geom.features
        // }
        let geom = await this_sublayer.queryFeatures({where:"1=1", returnGeometry: true, outFields:"*"})
        console.log(geom)
        var fields = this_sublayer.fields
        fields.push({"name":this.selectedField.id, type:"double"})
        console.log(this_sublayer)

        geom.features.forEach(feature=>{

          feature.attributes[this.selectedField.id] = this.attributes_object[feature.attributes.GEOID]
        })
        
        // this.$data[this_sublayer.title].forEach(feature=>{

        //   feature.attributes[this.selectedField.id] = this.attributes_object[feature.attributes.GEOID]
        // })
        this.activeGeometry = new FeatureLayer({
          source:geom.features,
          objectIdField: "OBJECTID",
          fields:fields
        })
        // this.activeGeometry = new FeatureLayer({
        //   source:this.$data[this_sublayer.title],
        //   objectIdField: "OBJECTID",
        //   fields:fields
        // })
        this.activeGeometry.renderer=renderer
        // console.log(await this.activeGeometry.queryFeatures())
        this.map.add(this.activeGeometry)
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
            layerOptions: {}
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