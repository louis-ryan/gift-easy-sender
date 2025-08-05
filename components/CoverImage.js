const CoverImage = ({ imageUrl }) => {

    return (
        <div style={{
            height: "400px",
            overflow: "hidden",
            position: "relative",
            width: "100vw", // Full viewport width
            marginLeft: "calc(-50vw + 50%)", // Centers the div if inside a contained element
            marginRight: "calc(-50vw + 50%)" // Centers the div if inside a contained element
        }}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="header image"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "relative",
                        display: "block"
                    }}
                />
            ) : (
                <img
                    src={"header_placeholder.webp"}
                    alt="header placeholder image"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "relative",
                        display: "block"
                    }}
                />
            )}
        </div>
    )
};

export default CoverImage;