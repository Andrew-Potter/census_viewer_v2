<template>
  <div>
    <Toolbar>
            <template #start>
                <!-- <Button label="New" icon="pi pi-plus" class="mr-2" />
                <Button label="Upload" icon="pi pi-upload" class="p-button-success" />
                <i class="pi pi-bars p-toolbar-separator mr-2" /> -->

            </template>

            <template #end>
                <!-- <Button icon="pi pi-search" class="mr-2" />
                <Button icon="pi pi-calendar" class="p-button-success mr-2" />
                <Button icon="pi pi-times" class="p-button-danger" /> -->
            </template>
    </Toolbar>
    <Splitter style="height: 100vh">
          <SplitterPanel v-if="showcharts" :size="40" :minSize="10">
            <div v-if="showcharts" style="width:100%">
              <div style="width:90%">
                <Chart type="bar" :data="barChartData" :options="basicOptions" />
              </div>

             
             

            </div>
           

          </SplitterPanel>
          <SplitterPanel :size="60">
            <Map @selectPolys="selectPolysHandler($event)"></Map>
          </SplitterPanel>
  </Splitter>

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
            showcharts:true,
            barChartData: null,
            basicOptions: null

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
