<template>
  <div>
    <Toolbar>
            <template #start>
              <Button label="Filters" icon="pi pi-filter-fill" @click="openFilters" />
              <Dialog header="Filters " :visible.sync="filtersOpen" :containerStyle="{width: '50vw'}">
                <Panel style="height:100vh; text-align: left;">
                  <Dropdown v-model="selectedGeometry" :options="geometries" optionLabel="alias" placeholder="Select a Geometry" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedSubjectArea" :options="subjectAreas" optionLabel="subject_area" placeholder="Select a Subject Area" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedTable" :options="filteredTables" optionLabel="displayNameShort" placeholder="Select a Table" dataKey="id" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedField" :options="filteredFields" optionLabel="aliasShort" placeholder="Select a Field" dataKey="id" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedNormField" :options="filteredFields" optionLabel="aliasShort" placeholder="Select a Normalization Field" dataKey="id" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedYear" :options="years"  placeholder="Select a Year" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Checkbox v-model="normalize" :binary="true" id="norm"></Checkbox>&nbsp;&nbsp;
                  <label for="norm">Normalize?</label><br>
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
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
                <b style="text-align: center; font-size: large;">
                  NCDOT Demographic Mapping and Analysis Application
                </b>

            </template>

           

            

            <template #end>

              <ToggleButton onIcon="pi pi-bars" offIcon="pi pi-bars"  v-model="showmenu"  />
                <!-- <Button icon="pi pi-search" class="mr-2" />
                <Button icon="pi pi-calendar" class="p-button-success mr-2" />
                <Button icon="pi pi-times" class="p-button-danger" /> -->
            </template>
    </Toolbar>
    <div style="height: 90vh">
      <Map @selectPolys="selectPolysHandler($event)" :selectedGeoUnit="selectedGeometry" :selectedSubjectArea="selectedSubjectArea" :selectedTable="selectedTable" :selectedField="selectedField" :selectedYear="selectedYear" :runQuery="runQuery" :selectedNormField="selectedNormField" :normalize="normalize"></Map>
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
      let tableResp = await esriRequest(this.baseurl+this.tableLookupIndex+"/query", {query:{f: "json", where:`1=1`, outFields:"*"}, responseType: "json"})
          tableResp.data.features.forEach(t =>{
            this.tableLookup[t.attributes.table_id] = t.attributes;

          })

          let geomLookupResp = await esriRequest(this.baseurl+this.geometryLookupIndex+"/query", {query:{f: "json", where:"1=1", outFields:"*"}, responseType: "json"})
          geomLookupResp.data.features.forEach(t =>{
            if (!Object.keys(this.geometryLookup).includes(t.attributes.geometry_level)){
              this.geometryLookup[t.attributes.geometry_level] = {tables:{}}
            }
            this.geometryLookup[t.attributes.geometry_level].tables[t.attributes.table_id]=t.attributes;

          })

          let resp = await esriRequest(this.baseurl, {query:{f: "json"}, responseType: "json"})
          console.log(resp)
          resp.data.layers.forEach(layer =>{
            this.geometries.push({alias: layer.name.split(".").at(-1), name: layer.name, id: layer.id})
          })
          var options = {
              query: {
                where: "1=1",
                outFields: "subject_area",
                returnDistinctValues: true,
                f: "json"
              },
              responseType: "json"
            };
          var subjectAreasResp = await esriRequest( this.baseurl+this.tableLookupIndex+"/query", options)
          console.log(subjectAreasResp)
          subjectAreasResp.data.features.forEach(s =>{
            this.subjectAreas.push(s.attributes)
          })
          console.log(this.tableLookup)
          resp.data.tables.forEach(table =>{

            console.log(table)

            if (!["FieldsLookUp", "GeometryReference", "TableLookUp"].includes(table.name)){
              this.tables.push(
                {
                  alias: table.name, 
                  name: table.name, id: table.id, 
                  displayName: this.tableLookup[table.name].table_title,
                  displayNameShort: this.tableLookup[table.name].table_title.slice(0,100),
                  subjectArea: this.tableLookup[table.name].subject_area
                }
              )
            }
          })

        },

  },

  watch:{
    async selectedSubjectArea(){
      let filtered_tables = []
      if(this.selectedGeometry==null){
        return []
      }
      if (this.selectedGeometry.alias == null){
        return []
      }
      if (this.geometryLookup[this.selectedGeometry.alias] == null){
        return []
      }
      
      let keys = Object.keys(this.geometryLookup[this.selectedGeometry.alias].tables)
      console.log(this.geometryLookup[this.selectedGeometry.alias])
      this.tables.forEach(t =>{

        if (keys.includes(t.alias) & t.subjectArea == this.selectedSubjectArea.subject_area){

          filtered_tables.push(t)
        }
      })
      this.filteredTables = filtered_tables
    },
    //   let resp = await esriRequest(this.baseurl, {query:{f: "json"}, responseType: "json"})

    //   resp.data.tables.forEach(table =>{
    //         let alias =  table.name.split(".").at(-1).replace("%", "")
    //         if (!["FIELDSLOOKUP", "GEOMETRYREFERENCE", "TABLELOOKUP"].includes(alias)){
    //           this.tables.push(
    //             {
    //               alias: alias, 
    //               name: table.name, id: table.id, 
    //               displayName: this.tableLookup[alias].TABLE_TITLE,
    //               displayNameShort: this.tableLookup[alias].TABLE_TITLE.slice(0,100),
    //               subjectArea: this.tableLookup[alias].SUBJECT_AREA
    //             }
    //           )
    //         }
    //       })


    //   let tableResp = await esriRequest(this.baseurl+this.tableLookupIndex+"/query", {query:{f: "json", where:`SUBJECT_AREA = ${this.selectedSubjectArea.SUBJECT_AREA}`, outFields:"*"}, responseType: "json"})
    //       tableResp.data.features.forEach(t =>{
    //         this.tableLookup[t.attributes.TABLE_ID] = t.attributes;

    //       })

    // },
    async selectedTable(){
      let filteredFields = [];
      this.filteredFields = [];
      // console.log(this.selected)
      // console.log(this.selectedTable.alias)
      let fields = this.geometryLookup[this.selectedGeometry.alias].tables[this.selectedTable.alias].fields.split("|")
      fields.forEach(f=>{
        filteredFields.push(f.toUpperCase());
      })
      let fieldsLookupResp = await esriRequest(this.baseurl+this.fieldLookupIndex+"/query", {query:{f: "json", where:`FIELD_ID in ('${filteredFields.join("', '")}')`, outFields:"*"}, responseType: "json"})
      let checkDups = []
      let fieldYears = {}
      fieldsLookupResp.data.features.forEach(f=>{
        if(!Object.keys(fieldYears).includes(f.attributes.field_id)){
          fieldYears[f.attributes.field_id] = []
        }  
        if(this.geometryLookup[this.selectedGeometry.alias].tables[this.selectedTable.alias].years.includes(f.attributes.year)){
          fieldYears[f.attributes.field_id].push(f.attributes.year)
        }      
        if (!checkDups.includes(f.attributes.field_id)){
          checkDups.push(f.attributes.field_id)
          let alias  = f.attributes.field_alias.split("|").at(-1)
          console.log(alias)
          this.filteredFields.push({id: f.attributes.field_id, alias:alias, aliasShort: alias.slice(0,100), years: fieldYears[f.attributes.field_id]})
        }
      })
    },
    async selectedField(){
      this.years = this.selectedField.years;
    }

  },

  computed:{

  },
  
  data(){
        return{
            baseurl: "https://vm16-78.vclgis.cnr.ncsu.edu/arcgis/rest/services/US_Census/nc_census_app/MapServer/",
            showcharts:false,
            barChartData: null,
            basicOptions: null,
            showfilters:false,
            showmenu:false,
            geometries: [],
            tables: [],
            selectedGeometry:null,
            selectedTable:null,
            tableLookupIndex: 166,
            tableLookup:{},
            filtersOpen: false,
            subjectAreas: [],
            selectedSubjectArea:null,
            geometryLookupIndex: 167,
            geometryLookup: {},
            filteredFields: [],
            selectedField: null,
            fieldLookupIndex: 165,
            years: [],
            selectedYear: null,
            runQuery:false,
            filteredTables: [],
            totalField: null,
            selectedNormField: null,
            normalize: false



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
