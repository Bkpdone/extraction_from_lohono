console.log("Jai Balaji\n");
/////////////////////////////////////////////code-start/////////////////////////////////////
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
})
import fs from 'fs';
import axios from "axios";
import createPdf from './createPdf.js';

const headers = {

    'Content-Type': 'application/json',
    'API-KEY': process.env.APYKEY

}

let countproperties=0;
let errorpropertList=[];
let errorpropertListCount=0;

let amenities=[];
const FindSlugsList = async(index)=>{
      try{
        console.log('chalu huwa');
        const res = await axios.get(`https://oi-api-staging.lohono.com/v2/partners_api/properties?page=${index}&per_page=100`, { headers });
        const slugListdataArr=res.data.properties;
      //  console.log('khatm huwa');
      //  console.log(slugListdataArr);
      //  console.log('print huwa');
        return slugListdataArr;
      }
      catch(err){
        console.log('Error in get List ',err);
      }
}

const FindsulgDetails =async(slug)=>{
   
      try{
        //console.log('Hi slug aaya ',slug);
        const res = await axios.get(`https://oi-api-staging.lohono.com/v2/partners_api/properties/${slug}`, { headers });
        const propertyData=res.data;
      //  console.log("Balji aap hi samalo : ",propertyData);
        countproperties++;
        return propertyData;
      }
      catch(err){
        errorpropertList.push(slug);
        errorpropertListCount++;
        return null;
        console.log('Error in FindSlugDetais',err);
      }
}

const ispresentinAmenities=(temp)=>{
      
      for(let val of amenities){
         if(val==temp){
            return true;
         }
      }
      return false;
}
const FindFeatures = async (property)=>{
      
      let arr = property.details.amenities;
      //console.log("arr ",arr);
      for(let val of arr){
          let temp = val.name;
          console.log(temp);
          if(!ispresentinAmenities(temp)){
              amenities.push(temp);
          }
      }


}



const mainFun = async () => {

    try {
        const apiListpageRes = await axios.get("https://oi-api-staging.lohono.com/v2/partners_api/properties?page=1&per_page=100", { headers });
        const apiListpage = apiListpageRes.data.paginate;
        const { total_records,
            total_pages,
            start_offset,
            end_offset
            , current_page } = apiListpage;

        console.log(apiListpage);
         
        for(let i=1;i<=total_pages;++i){
            
          console.log('call page: ',i);
            const slugsList =await FindSlugsList(i);
          //  console.log('End : ',slugsList);
            for(let j=0;j<slugsList.length;++j){
              console.log(`call page: ${i}, slug index : ${j}`)
                console.log('Hi i am :',slugsList[j].slug);
                const getsulgData=await FindsulgDetails(slugsList[j].slug);
                if(getsulgData==null)continue;
                await FindFeatures(getsulgData.property);
                
            } 
           
        }
         
        console.log("kya huwa: ",countproperties);
        console.log('Error properties',errorpropertList);
        console.log('Error properties List',errorpropertListCount);




        let NameErrorListPropertiesSlug=['\n'];

        for(let small of errorpropertList){
           NameErrorListPropertiesSlug.push(small+' \n');
        }

        let concatenatedString = NameErrorListPropertiesSlug.join('');
        NameErrorListPropertiesSlug=concatenatedString;

        console.log('Final Data',amenities);
        const Finalamenities=[];
        for(let val of amenities){
          Finalamenities.push({
            amenitieType: val, res: ['yes'] 
          })
        }


        // make pdf Doc

        const title = "All Amenitie From Lohono Stayging";
        const description = `All Unique parameters after scanning all API\nTotal No of Propeties Scan :${total_records} and Total pages: ${total_pages}\nDefine properties:${countproperties} and Undefine propertes:${errorpropertListCount}\n Error/Undefine Listed Property : ${NameErrorListPropertiesSlug} `;

       
        console.log(description);

     
 
        createPdf(title, description,Finalamenities)
        .then(pdfBytes => {
            
            const pdfFileName = `${title}.pdf`;
            fs.writeFileSync(pdfFileName, pdfBytes);
            console.log(`PDF ${pdfFileName} created and saved successfully.`);
        })
        .catch(error => {
            console.error("Error creating PDF x x x :", error);

        });
  

    } catch (error) {
        // Handle errorspaginate
        console.log('error in main Fun ', error);
    }
}
mainFun();
