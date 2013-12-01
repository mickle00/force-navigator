<script type="text/html" id="sfnav">
	
		<div class="sfnav">
		  <div class="sfnav-search">
		    <input class="sfnav-search-field" type="search" value="" placeholder="Search">
		  </div>
		  <ul>
		  </ul>
		</div>
	 
</script>
<!--
  <div id="<%=id%>" class="<%=(i % 2 == 1 ? " even" : "")%>">
    <div class="grid_1 alpha right">
      <img class="righted" src="<%=profile_image_url%>"/>
    </div>
    <div class="grid_6 omega contents">
      <p><b><a href="/<%=from_user%>"><%=from_user%></a>:</b> <%=text%></p>
    </div>
  </div>
</script>
-->
<script type="text/html" id="sfnav-li">
    <li class="">
      <div class="sfnav-icon fui-user"></div>
      <div class="sfnav-content">
        <h4 class="sfnav-name">
          <%=title%>
        </h4>
        <%=description%>
      </div>
    </li>
</script>