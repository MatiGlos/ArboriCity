export const MOCK_ARBOLES = [
  // ... tus datos actuales si deseas mantenerlos
  ...Array.from({ length: 5000 }).map((_, i) => {
    const especies = [
      { nom: "Peumo", cien: "Cryptocarya alba", esp: "Lauraceae" },
      { nom: "Boldo", cien: "Peumus boldus", esp: "Monimiaceae" },
      { nom: "Quillay", cien: "Quillaja saponaria", esp: "Quillajaceae" },
      { nom: "Maitén", cien: "Maytenus boaria", esp: "Celastraceae" },
      { nom: "Araucaria", cien: "Araucaria araucana", esp: "Araucariaceae" },
      { nom: "Arrayán", cien: "Luma apiculata", esp: "Myrtaceae" },
      { nom: "Coigüe", cien: "Nothofagus dombeyi", esp: "Nothofagaceae" }
    ];
    
    const estados = ["Saludable", "Regular", "Malo", "Muerto"];
    const seleccion = especies[Math.floor(Math.random() * especies.length)];
    
    return {
      id_arbol: 2000 + i,
      nom_arbol: seleccion.nom,
      nom_cientifico: seleccion.cien,
      especie: seleccion.esp,
      // Coordenadas esparcidas cerca de tu zona actual (-36.82, -73.05)
      lat: -36.8200 - (Math.random() * 0.02), 
      lng: -73.0400 - (Math.random() * 0.02),
      edad: Math.floor(Math.random() * 80) + 5,
      altura: (Math.random() * 15 + 2).toFixed(1),
      estado: estados[Math.floor(Math.random() * estados.length)],
      descripcion: "Árbol de prueba para estrés de carga de datos.",
      imagen: null
    };
  })
];