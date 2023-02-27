<template>
  <div>
    <Toolbar style="10 vh">
      <!-- <ToggleButton onLabel="Query Data" offLabel="QueryData" onIcon="pi pi-filter" offIcon="pi pi-filter" class="p-mr-2" v-model="show_filters" /> -->

            <template #start>
              <ToggleButton onLabel="Query Data" offLabel="Query Data" onIcon="pi pi-filter" offIcon="pi pi-filter" class="p-mr-2" v-model="show_filters" />
              <ToggleButton onLabel="Show Charts" offLabel="Show Charts" onIcon="pi pi-filter" offIcon="pi pi-filter" class="p-mr-2" v-model="show_charts" />


              <Button label="Filters" icon="pi pi-filter-fill" @click="openFilters" />
              <Dialog header="Filters " :visible.sync="filtersOpen" :containerStyle="{width: '50vw'}">
                <Panel style="height:100vh; text-align: left;">
                  <Dropdown v-model="selectedGeometry" :options="geometries" optionLabel="alias" placeholder="Select a Geometry" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
                  <Dropdown v-model="selectedSubjectArea" :options="subjectAreas" optionLabel="SUBJECT_AREA" placeholder="Select a Subject Area" :filter="true" style="min-width:200px; max-width:90vw; text-align: left;"/><br>
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
    <div data-flex-splitter-horizontal style="flex: auto; height:90vh">
      <div style="width:30%">
        <Panel style="height:100vh; text-align: left; width:100%;">
          <FilterItem filter_name="Geometry" filter_title="Geometry" :options="geometries" display_field="alias" @selectedOption="selectedOptionHandler($event)"/>
          <FilterItem filter_name="SubjectArea" filter_title="Subject Area" :options="subjectAreas" display_field="alias"  @selectedOption="selectedOptionHandler($event)"/>
          <FilterItem filter_name="Table" filter_title="Table" :options="filteredTables" display_field="displayNameShort" @selectedOption="selectedOptionHandler($event)"/>
          <FilterItem filter_name="Field" filter_title="Field" :options="filteredFields" display_field="aliasLong" @selectedOption="selectedOptionHandler($event)"/>
          <FilterItem filter_name="NormField" filter_title="Normalization Field" :options="filteredFields" display_field="aliasLong" @selectedOption="selectedOptionHandler($event)"/>
          <FilterItem filter_name="Year" filter_title="Year" :options="years" display_field="alias" @selectedOption="selectedOptionHandler($event)"/>

          <Button label="Run Query" icon="pi pi-run" @click="(runQuery = !runQuery);(filtersOpen = false)" />

        </Panel>
      </div>
      <div role="separator"></div>
      <div style="flex-grow: 1">
        <Map @selectPolys="selectPolysHandler($event)" :selectedGeoUnit="selectedGeometry" :selectedSubjectArea="selectedSubjectArea" :selectedTable="selectedTable" :selectedField="selectedField" :selectedYear="selectedYear" :runQuery="runQuery" :selectedNormField="selectedNormField" :normalize="normalize"></Map>
      </div>
    </div>
 </div>
    
</template>


<script>
import "flex-splitter-directive"
import "flex-splitter-directive/styles.min.css"
import Map from "./components/WebMap.vue"
import esriRequest from "@arcgis/core/request"
import FilterItem from "./components/FilterItem.vue"

export default {
  name: 'App',
  components: {
    Map,
    FilterItem
  },
  async mounted(){
    this.generateOptions();
    
  },
  methods:{
    selectedOptionHandler(event)
      {
        this.$data[`selected${event.filter_name}`]=event.selectedOption;
        console.log(this.selectedGeometry)
      }
    ,
    openFilters(){
      this.filtersOpen = true;
    },
    async generateOptions(){
      let tableResp = await esriRequest(this.baseurl+this.tableLookupIndex+"/query", {query:{f: "json", where:`1=1`, outFields:"*"}, responseType: "json"})
      console.log(tableResp);
          tableResp.data.features.forEach(t =>{
            this.tableLookup[t.attributes.TABLE_ID] = t.attributes;

          })

          let geomLookupResp = await esriRequest(this.baseurl+this.geometryLookupIndex+"/query", {query:{f: "json", where:"1=1", outFields:"*"}, responseType: "json"})
          console.log(geomLookupResp)
          geomLookupResp.data.features.forEach(t =>{
            let geometryLevel = t.attributes.Geometry_Level.toUpperCase();
            if (!Object.keys(this.geometryLookup).includes(geometryLevel)){
              this.geometryLookup[geometryLevel] = {tables:{}}
            }
            this.geometryLookup[geometryLevel].tables[t.attributes.Table_ID]=t.attributes;

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
          let i = 0;
          subjectAreasResp.data.features.forEach(s =>{
            this.subjectAreas.push({alias: s.attributes.SUBJECT_AREA, id:i, name:s.attributes.SUBJECT_AREA})
            i+=1;
          })
          console.log(this.tableLookup)
          resp.data.tables.forEach(table =>{

            console.log(table)
            var table_name = table.name.split(".").at(-1)
            if (!["FIELDSLOOKUP", "GEOMETRYREFERENCE", "TABLELOOKUP"].includes(table_name)){
              this.tables.push(
                
                {
                  alias: table_name, 
                  name: table_name, id: table.id, 
                  displayName: this.tableLookup[table_name].TABLE_TITLE,
                  displayNameShort: this.tableLookup[table_name].TABLE_TITLE.slice(0,100),
                  subjectArea: this.tableLookup[table_name].SUBJECT_AREA
                }
              )
            }
          })

        },

  },

  watch:{
    async selectedSubjectArea(){
      let filtered_tables = []
      console.log(this.selectedGeometry)
      if(this.selectedGeometry==null){
        return []
      }
      if (this.selectedGeometry == null){
        return []
      }
      
      if (this.geometryLookup[this.selectedGeometry.alias] == null){
        return []
      }
      
      let keys = Object.keys(this.geometryLookup[this.selectedGeometry.alias].tables)
      console.log(this.geometryLookup[this.selectedGeometry.alias])
      console.log(keys);
      this.tables.forEach(t =>{
        if (keys.includes(t.alias) & t.subjectArea == this.selectedSubjectArea.alias){

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
      let fields = this.geometryLookup[this.selectedGeometry.alias].tables[this.selectedTable.name].Fields.split("|")
      fields.forEach(f=>{
        filteredFields.push(f.toUpperCase());
      })
      var fieldsLookupResp = await esriRequest(this.baseurl+this.fieldLookupIndex+"/query", {query:{f: "json", where:`FIELD_ID in ('${filteredFields.join("', '")}')`, outFields:"*"}, responseType: "json"})
      var checkDups = []
      var fieldYears = {}
      fieldsLookupResp.data.features.forEach(f=>{
        if(!Object.keys(fieldYears).includes(f.attributes.FIELD_ID)){
          fieldYears[f.attributes.FIELD_ID] = []
        }  
        if(this.geometryLookup[this.selectedGeometry.alias].tables[this.selectedTable.name].Years.includes(f.attributes.YEAR)){
          fieldYears[f.attributes.FIELD_ID].push(f.attributes.YEAR)
        }      
        if (!checkDups.includes(f.attributes.FIELD_ID)){
          checkDups.push(f.attributes.FIELD_ID)
          let alias  = f.attributes.FIELD_ALIAS.split("|").at(-1)
          let aliasLong = f.attributes.FIELD_ALIAS.split("|").slice(1,f.attributes.FIELD_ALIAS.length).join("|")
          console.log(alias)
          this.filteredFields.push({id: f.attributes.FIELD_ID,aliasLong: aliasLong, alias:alias, aliasShort: alias.slice(0,100), years: fieldYears[f.attributes.FIELD_ID]})
        }
      })
      console.log(this.filteredFields)
    },
    async selectedField(){
      var years = []
      this.selectedField.years.forEach(y=> years.push({alias: y}))
      this.years = years;
    }

  },

  computed:{

  },
  
  data(){
        return{
            baseurl: "https://ncdotsandbox.cnr.ncsu.edu/arcgis/rest/services/DemographicApp/DemographicAppWMS/MapServer/",
            showcharts:false,
            barChartData: null,
            basicOptions: null,
            showfilters:false,
            showmenu:false,
            geometries: [],
            tables: [],
            selectedGeometry:null,
            selectedTable:null,
            tableLookupIndex: 157,
            tableLookup:{},
            filtersOpen: false,
            subjectAreas: [],
            selectedSubjectArea:null,
            geometryLookupIndex: 156,
            geometryLookup: {},
            filteredFields: [],
            selectedField: null,
            fieldLookupIndex: 155,
            years: [],
            selectedYear: null,
            runQuery:false,
            filteredTables: [],
            totalField: null,
            selectedNormField: null,
            normalize: false,
            show_filters: true,
            show_charts: false



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
