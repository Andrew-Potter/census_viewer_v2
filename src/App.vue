<template>
  <div>
    <Toolbar>
            <template #start>
              
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
      <Map @selectPolys="selectPolysHandler($event)"></Map>
      <Sidebar :visible.sync="showmenu" :baseZIndex="1000" position="right" :modal=false  style="height:100vh">
                <Panel style="height:100vh">
                  <Dropdown v-model="selectedGeometry" :options="geometries" optionLabel="name" placeholder="Select a Geometry" />

                </Panel>

    </Sidebar>
    </div>
   



 </div>
    
</template>

<script>
import Map from "./components/WebMap.vue"

export default {
  name: 'App',
  components: {
    Map
  },
  data(){
        return{
            showcharts:false,
            barChartData: null,
            basicOptions: null,
            showfilters:false,
            showmenu:false,
            geometries: [
              {name:"Counties", code:"1",other:"other"},
              {name:"BlockGroups", code:"0", other:"other"}
          ],
            selectedGeometry:null


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
