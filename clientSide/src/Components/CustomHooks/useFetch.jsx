import { useState, useEffect } from "react";

const useFetch = (url) => {
    const [data, setData] = useState(null);
    console.log(url);

    useEffect(() => {
        console.log("fk")
        fetch(url)
            .then((res) => res.json())
            .then((fetchedData) => {
                console.log(fetchedData);
                setData(fetchedData); // Update state with fetched data
            })
            .catch(error => console.error(error));
    }, [url]);

    return [data];
};

export default useFetch;
