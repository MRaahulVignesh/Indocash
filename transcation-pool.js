const Transcation = require('./transcation');
class TranscationPool{
    constructor(){
        this.transcationMap = {};
    }

    clear()
    {
        this.transcationMap = {};
    }
    
    setTranscation(transcation)
    {
        this.transcationMap[transcation.id]=transcation;
    }

    setMap({transcationMap}) {
        this.transcationMap = transcationMap;
      }

     existingTranscation({ inputAddress }) {
        
        const transcations = Object.values(this.transcationMap);

    return transcations.find(transcation => transcation.input.address === inputAddress);
      }

    validTranscations()
    {
        return Object.values(this.transcationMap)
       .filter(transcation => Transcation.validTranscation(transcation));
     }

     clearBlockchainTranscations({chain})
     {
         for(let i=1;i<chain.length;i++)
         {
             const block = chain[i];

             for(let transcation of block.data)
             {
                 if(this.transcationMap[transcation.id])
                 {
                     delete this.transcationMap[transcation.id];
                 }
             }
         }
     }
    
}
module.exports = TranscationPool;