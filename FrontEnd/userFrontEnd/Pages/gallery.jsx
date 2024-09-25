import React from "react";
import { useEffect, useState } from "react";
import { userApi } from "../config/axios";

const Gallery = () => {
    const [gallery, setgallery] = useState ([]);

    useEffect(() => {
    fetchGallery();
    },[])


const fetchGallery = async () => {
    try {
        const response = await userApi.get('/api/gallery')
        setgallery(response.data);
    } catch (error) {
        console.error('unable to display gallery!', error)
    }
 }
 return (
    <div className="gallery">
     {gallery.map(item => (
         <div className="gallery-tile" key={item.id}>
             <img src={`http://localhost:3450/gallery/${item.image}`} alt={item.name} />
             <div className="product-info">
                 <h3>{item.name}</h3>
                 <p>{item.description}</p>
                 <p>{item.price}</p>
 
             </div>
         </div>
     )) 
     }
 
    </div>
 )
};



export default Gallery