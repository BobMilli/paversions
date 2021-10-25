<template>
  <q-page class='q-pa-md'>
      <h4 class='no-padding no-margin'>Planning Analytics Versions</h4>
      <p>Directly from the IBM site, all the information about the latest versions of the Planning Analytics softwares.<br/>
      Done by <b>robert.milli@gmail.com</b> using <a href="https://quasar.dev">quasar</a>. Source available on my <a href="https://github.com/BobMilli/paversions"> paversions github repository</a> </p>

      <q-btn-group  class=" justify-center full-width" >
        <q-btn color="grey-2" text-color="black" glossy label="Planning Analytics Workspace" @click="OpenLink('PAW')" />
        <q-btn color="grey-4" text-color="black" glossy label="Planning Analytics for Microsoft Excel"  @click="OpenLink('PAX')" />
        <q-btn color="grey-6" glossy label="Planning Analytics Local (TM1)"  @click="OpenLink('TM1')"/>
        <q-btn color="grey-8" glossy label="Planning Analytics Spreadsheet Services (TM1Web)"  @click="OpenLink('TM1Web')"/>
      </q-btn-group>
      <q-table
        :rows='paversions'
        :columns='columns'
        dark
        row-key='name'
        no-data-label="Retrieving information from the IBM website."
        :loading="loading"
        :rows-per-page-options="[10,15,20,0]"
      >
      <template v-slot:body-cell="props">
        <q-td :props="props" :class="props.row.PAProduct">
          {{props.value}}
        </q-td>
      </template>
      <template v-slot:top-right>
        <q-btn
          color="primary"
          icon-right="archive"
          label="Export to csv"
          no-caps
          @click="exportTable"
        />
      </template>
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>

  </q-page>
</template>

<script>
import { exportFile } from 'quasar'
import { date } from 'quasar'

export default {
  name: 'PageIndex',
  data () {
    return {
      loading: true,
      columns: [
        {
          name: 'PAProduct:',
          label: 'Planning Analytics Product',
          align: 'left',
          field: 'PAProduct',
          sortable: true
        },
        {
          name: 'PAVersionNumber',
          align: 'center',
          label: 'Version',
          field: 'PAVersionNumber',
          sortable: true
        },
        {
          name: 'PAVersionDate',
          align: 'left',
          label: 'Release Date',
          field: 'PAVersionDate',
          sortable: true,
          format: val => date.formatDate(val, 'Do MMMM YYYY')
        }
      ],
      paversions: []
    }
  },
  methods: {
    exportTable () {
      const content = [this.columns.map(col => col.label)].concat(
        this.paversions.map(row => '"' + row.PAProduct + '","' + row.PAVersionNumber + '","' + row.PAVersionDate + '"')
      ).join('\r\n')

      const status = exportFile(
        'table-export.csv',
        content,
        'text/csv'
      )

      if (status !== true) {
        this.$q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    GetPAVersion () {
      let backendURLroot = /^(?:https?:??:\/\/)?[^\/\?]+/gim.exec(
          window.location.href
      )[0]
      // if we're in dev environment we know the backend server host & port so let's adapt it
      if (backendURLroot.includes('localhost')) {
        backendURLroot = 'http://localhost:3000'
      }

      // I'm querying product by product in order to avoid Heroku timeout issue.
      // on a local server, a single fetch of /paversions endpoint will return the whole set of product/versions
      let backendURL = backendURLroot + '/paversionsPAW'
      fetch(backendURL)
        .then(response => response.json())
        .then(data => {
          this.paversions = data
          backendURL = backendURLroot + '/paversionsPAX'
          fetch(backendURL)
            .then(response => response.json())
            .then(data => {
              Array.prototype.push.apply(this.paversions, data)

              backendURL = backendURLroot + '/paversionsTM1'
              fetch(backendURL)
                .then(response => response.json())
                .then(data => {
                  Array.prototype.push.apply(this.paversions, data)

                  backendURL = backendURLroot + '/paversionsTM1Web'
                  fetch(backendURL)
                    .then(response => response.json())
                    .then(data => {
                      Array.prototype.push.apply(this.paversions, data)
                      this.loading = false
                    })
                    .catch(error => console.error(error))

                })
                .catch(error => console.error(error))

            })
            .catch(error => console.error(error))
        })
        .catch(error => console.error(error))
    },
    OpenLink (PAProduct) {
      switch (PAProduct) {
        case 'PAW':
          window.open('https://www.ibm.com/support/knowledgecenter/SSD29G_2.0.0/com.ibm.swg.ba.cognos.tm1_nfg.2.0.0.doc/c_new_features_paw.html', '_blank')
          break
        case 'PAX':
          window.open('https://www.ibm.com/support/knowledgecenter/SSD29G_2.0.0/com.ibm.swg.ba.cognos.tm1_nfg.2.0.0.doc/c_nfg_pax_test.html', '_blank')
          break
        case 'TM1':
          window.open('https://www.ibm.com/support/knowledgecenter/SSD29G_2.0.0/com.ibm.swg.ba.cognos.tm1_nfg.2.0.0.doc/c_pa_nfg_introduction.html', '_blank')
          break
        case 'TM1Web':
          window.open('https://www.ibm.com/support/knowledgecenter/SSD29G_2.0.0/com.ibm.swg.ba.cognos.tm1_nfg.2.0.0.doc/c_nfg_tm1_web.html', '_blank')
          break
      }
    }
  },
  mounted () {
    this.GetPAVersion()
  }
}
</script>

<style  lang="scss">
.PAW.q-td {
  background-color: $grey-2;
  color: black;
}
.PAX.q-td {
  background-color: $grey-4;
  color: black;
}
.TM1.q-td {
  background-color: $grey-6;
}
.TM1Web.q-td {
  background-color: $grey-8;
}
</style>

