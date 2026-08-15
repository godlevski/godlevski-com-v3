import { IntroSlide } from '@godlevski/schemas/controllers/introData';

// ported verbatim from v2.1 server/routers/introDataRouter.js — the intro copy
// was hardcoded there too; moves to D1 if/when it needs editing from an admin
export const introData: IntroSlide[] = [
  {
    title: "mern: full stack design & development",
    text: "Untangling business tasks through consolidated interactive mediums. Web+ applications with emphasis on visual appeal, minimalism, unique measured details and simplified flows. Offering versatile experience in javascript and focus on related modern flavors ",
    shapefile: "/files/shapefiles/knot-01.shapefile.json",
    tags: ["react.js", "mongo db", "express.js", "node"],
    icons: ["photoshop", "illustrator", "", "sublime"]
  },
  {
    title: "user \ninterfaces, \nfront end",
    text: "Delivering soul & mind crafted scalable solutions  with an idea of form and substance undevided.  As convertions are hugely limited by attention focus  of the user, it is my vision, that modern frontier  is at providing users with most tools at the  least access points and keaping them depth adjustable     ",
    shapefile: "/files/shapefiles/mask-02.shapefile.json"
  },
  {
    title: "identity & \nstylistical\n unity",
    text: "As web spaces become our native habitat, meaningfull graphical shape and image are crusial in bulding company’s success though it’s culture, shaping the perception of it’s employees and unifing ranges of outreach in distinct visual ideas to create solid lasting impression in customer’s experiences.    ",
    shapefile: "/files/shapefiles/mask-03.shapefile.json"
  },
  {
    title: "detail \noriented \nimplementation",
    text: "While weighted planning and good design   is a far reaching start of any project, it is the  enactment that saturates end product to its best. Where some discrepancies can be omited, the others  will have a drastic effect on the outcome.  Committed to implementing “vision first”.",
    shapefile: "/files/shapefiles/prism-04.shapefile.json"
  },
  {
    title: "rich \ncontent \nmediums",
    text: "Rapidly developing community is demanding to always aim towards next big thing, similary it is our belief, that addressing how and  when things appear to the user via animative  approach is just as important as what they  are and may be a substential step in crafting  future prospectives.",
    shapefile: "/files/shapefiles/window-05.shapefile.json"
  }
];
