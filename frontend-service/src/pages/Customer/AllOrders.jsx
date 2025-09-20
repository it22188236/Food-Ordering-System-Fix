import React, { useEffect, useState } from 'react'

const AllOrders = () => {

    const [orders,setOrders] = useState([]);

    useEffect(()=>{

        const getOrders = async()=>{
            try{
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:5021/api/order/all-orders`,{
                    method:"GET",
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })

                const result = await response.json();

                if(response.ok){
                    setOrders(result.data);
                    console.log(result);
                }
                
            }catch(error){
                console.log(error);
            }
        }

        getOrders();

    },[])
  return (
    <div>
      
    </div>
  )
}

export default AllOrders
