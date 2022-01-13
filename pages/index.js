import React, {useState, useEffect} from "react";
import Cube, {setImportPromise} from "../components/cube/cube";

export default function Home() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const promiseTHREE = import('../utils/three/three')
            .then(() => import('../components/cube/game'))
            .then((data) => {
                setLoaded(true);
                return data;
            });

        setImportPromise(promiseTHREE);
    }, []);

    return (
        loaded ? <Cube/> : <p>Loading...</p>
    )
}

export async function getStaticProps() {
    return {
        props: {},
    };
}
