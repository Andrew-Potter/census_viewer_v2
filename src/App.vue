<template>
  <div>
    <Toolbar>
            <template #start>
              <Button label="Filters" icon="pi pi-external-link" @click="openFilters" />
              <Dialog header="Filters " :visible.sync="filtersOpen" :containerStyle="{width: '50vw'}">
                <Panel style="height:100vh; text-align: left;">
                  <Dropdown v-model="selectedGeometry" :options="geometries" optionLabel="alias" placeholder="Select a Geometry" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedSubjectArea" :options="subjectAreas" optionLabel="SUBJECT_AREA" placeholder="Select a Subject Area" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedTable" :options="filteredTables" optionLabel="displayNameShort" placeholder="Select a Table" dataKey="id" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedField" :options="filteredFields" optionLabel="aliasShort" placeholder="Select a Field" dataKey="id" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedYear" :options="years"  placeholder="Select a Year" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Button label="Run Query" icon="pi pi-run" @click="(runQuery = !runQuery);(filtersOpen = false)" />

                </Panel>
                <!-- <template #footer>
                    <Button label="No" icon="pi pi-times" @click="closeBasic" class="p-button-text"/>
                    <Button label="Yes" icon="pi pi-check" @click="closeBasic" autofocus />
                </template> -->
            </Dialog>
              
              <!-- <ToggleButton  onLabel="Hide Filters" offLabel="Show Filters" v-model="showfilters"  /> -->
                <!-- <Button label="New" icon="pi pi-plus" class="mr-2" />
                <Button label="Upload" icon="pi pi-upload" class="p-button-success" />
                <i class="pi pi-bars p-toolbar-separator mr-2" /> -->

            </template>

            <template #end>

              <ToggleButton onIcon="pi pi-bars" offIcon="pi pi-bars"  v-model="showmenu"  />
                <!-- <Button icon="pi pi-search" class="mr-2" />
                <Button icon="pi pi-calendar" class="p-button-success mr-2" />
                <Button icon="pi pi-times" class="p-button-danger" /> -->
            </template>
    </Toolbar>
    <div style="height: 90vh">
      <Map @selectPolys="selectPolysHandler($event)" :selectedGeoUnit="selectedGeometry" :selectedSubjectArea="selectedSubjectArea" :selectedTable="selectedTable" :selectedField="selectedField" :selectedYear="selectedYear" :runQuery="runQuery"></Map>
      <Sidebar :visible.sync="showmenu" :baseZIndex="1000" position="right" :modal=false  style="height:100vh">
                <!-- <Panel style="height:100vh">
                  <Dropdown v-model="selectedGeometry" :options="geometries" optionLabel="alias" placeholder="Select a Geometry" style="min-width:200px"/>
                  <Dropdown v-model="selectedTable" :options="tables" optionLabel="displayName" placeholder="Select a Table" style="min-width:200px"/>

                </Panel> -->

    </Sidebar>
    </div>
   



 </div>
    
</template>

<script>
import Map from "./components/WebMap.vue"
import esriRequest from "@arcgis/core/request"

export default {
  name: 'App',
  components: {
    Map
  },
  async mounted(){
    this.generateOptions();
    
  },
  methods:{
    openFilters(){
      this.filtersOpen = true;
    },
    async generateOptions(){

          let tableResp = await esriRequest(this.baseurl+this.tableLookupIndex+"/query", {query:{f: "json", where:"1=1", outFields:"*"}, responseType: "json"})
          tableResp.data.features.forEach(t =>{
            this.tableLookup[t.attributes.TABLE_ID] = t.attributes;

          })
          console.log(this.tableLookup)
          let geomLookupResp = await esriRequest(this.baseurl+this.geometryLookupIndex+"/query", {query:{f: "json", where:"1=1", outFields:"*"}, responseType: "json"})
          geomLookupResp.data.features.forEach(t =>{
            if (!Object.keys(this.geometryLookup).includes(t.attributes.Geometry_Level.toUpperCase())){
              this.geometryLookup[t.attributes.Geometry_Level.toUpperCase()] = {tables:{}}
            }
            this.geometryLookup[t.attributes.Geometry_Level.toUpperCase()].tables[t.attributes.Table_ID]=t.attributes;

          })

          let resp = await esriRequest(this.baseurl, {query:{f: "json"}, responseType: "json"})
          resp.data.layers.forEach(layer =>{
            this.geometries.push({alias: layer.name.split(".").at(-1), name: layer.name, id: layer.id})
          })
          var options = {
              query: {
                where: "1=1",
                outFields: "SUBJECT_AREA",
                returnDistinctValues: true,
                f: "json"
              },
              responseType: "json"
            };
          var subjectAreasResp = await esriRequest( this.baseurl+this.tableLookupIndex+"/query", options)
          subjectAreasResp.data.features.forEach(s =>{
            this.subjectAreas.push(s.attributes)
          })
          console.log(subjectAreasResp)
          resp.data.tables.forEach(table =>{
            let alias =  table.name.split(".").at(-1).replace("%", "")
            if (!["FIELDSLOOKUP", "GEOMETRYREFERENCE", "TABLELOOKUP"].includes(alias)){
              this.tables.push(
                {
                  alias: alias, 
                  name: table.name, id: table.id, 
                  displayName: this.tableLookup[alias].TABLE_TITLE,
                  displayNameShort: this.tableLookup[alias].TABLE_TITLE.slice(0,100),
                  subjectArea: this.tableLookup[alias].SUBJECT_AREA
                }
              )
            }
          })
        },

  },

  watch:{
    async selectedTable(){
      let filteredFields = [];
      this.filteredFields = [];
      console.log(this.geometryLookup[this.selectedGeometry.alias].tables[this.selectedTable.alias].Fields)
      // console.log(this.selected)
      // console.log(this.selectedTable.alias)
      let fields = this.geometryLookup[this.selectedGeometry.alias].tables[this.selectedTable.alias].Fields.split("|")
      fields.forEach(f=>{
        filteredFields.push(f.toUpperCase());
      })
      let fieldsLookupResp = await esriRequest(this.baseurl+this.fieldLookupIndex+"/query", {query:{f: "json", where:`FIELD_ID in ('${filteredFields.join("', '")}')`, outFields:"*"}, responseType: "json"})
      let checkDups = []
      let fieldYears = {}
      fieldsLookupResp.data.features.forEach(f=>{
        if(!Object.keys(fieldYears).includes(f.attributes.FIELD_ID)){
          fieldYears[f.attributes.FIELD_ID] = []
        }        
        fieldYears[f.attributes.FIELD_ID].push(f.attributes.YEAR)
        if (!checkDups.includes(f.attributes.FIELD_ID)){
          checkDups.push(f.attributes.FIELD_ID)
          this.filteredFields.push({id: f.attributes.FIELD_ID, alias: f.attributes.FIELD_ALIAS, aliasShort: f.attributes.FIELD_ALIAS.slice(0,100), years: fieldYears[f.attributes.FIELD_ID]})
        }
      })
      console.log(this.filteredFields)
    },
    async selectedField(){
      this.years = this.selectedField.years;
    }

  },

  computed:{
    filteredTables(){
      let filtered_tables = []
      let keys = Object.keys(this.geometryLookup[this.selectedGeometry.alias].tables)
      console.log(this.geometryLookup[this.selectedGeometry.alias])
      this.tables.forEach(t =>{

        if (keys.includes(t.alias) & t.subjectArea == this.selectedSubjectArea.SUBJECT_AREA){

          filtered_tables.push(t)
        }
      })
      console.log(filtered_tables)
      return filtered_tables
      
    },
  },
  
  data(){
        return{
            baseurl: "https://ncdotsandbox.cnr.ncsu.edu/arcgis/rest/services/DemographicApp/DemographicWebMap/MapServer/",
            showcharts:false,
            barChartData: null,
            basicOptions: null,
            showfilters:false,
            showmenu:false,
            geometries: [],
            tables: [],
            selectedGeometry:{
              alias:"COUNTIES",
              id: 1,
              name: "NCDOT_Demographics.dbo.COUNTIES"
            },
            selectedTable:null,
            tableLookupIndex: 157,
            tableLookup:{},
            filtersOpen: false,
            subjectAreas: [],
            selectedSubjectArea:{SUBJECT_AREA: "Race"},
            geometryLookupIndex: 156,
            geometryLookup: {},
            filteredFields: [],
            selectedField: null,
            fieldLookupIndex: 155,
            years: [],
            selectedYear: null,
            runQuery:false


        }
    },
}
</script>

<style>
@import './main.css';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
